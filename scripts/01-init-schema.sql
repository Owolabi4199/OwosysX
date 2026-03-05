-- Initialize database schema for cold email automation platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- SMTP Credentials table (encrypted)
CREATE TABLE IF NOT EXISTS smtp_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INT NOT NULL,
  smtp_user VARCHAR(255) NOT NULL,
  smtp_password_encrypted VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, email)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, active, paused, completed
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Email Sequences table
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL,
  order_number INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  delay_hours INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  UNIQUE(campaign_id, order_number)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'not_sent', -- not_sent, sent, opened, clicked, replied, qualified, booked_call, unsubscribed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Email Logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL,
  sequence_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  tracking_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  email_thread_id VARCHAR(255),
  reply_text TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  categorized_as VARCHAR(50), -- interested, not_interested, out_of_office, spam, other
  human_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Booked Calls table
CREATE TABLE IF NOT EXISTS booked_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,
  booking_link VARCHAR(255),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_email_logs_lead ON email_logs(lead_id);
CREATE INDEX idx_email_logs_tracking ON email_logs(tracking_token);
CREATE INDEX idx_replies_lead ON replies(lead_id);
CREATE INDEX idx_booked_calls_lead ON booked_calls(lead_id);
CREATE INDEX idx_smtp_credentials_workspace ON smtp_credentials(workspace_id);
CREATE INDEX idx_email_sequences_campaign ON email_sequences(campaign_id);

-- Set up RLS (Row Level Security) policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE smtp_credentials ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can see only their own workspaces
CREATE POLICY "Users can see own workspaces" ON workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- RLS policy: Users can see campaigns in their workspaces
CREATE POLICY "Users can see campaigns in their workspaces" ON campaigns
  FOR SELECT USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can create campaigns in their workspaces" ON campaigns
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

-- RLS policy: Users can see leads in their campaigns
CREATE POLICY "Users can see leads in their campaigns" ON leads
  FOR SELECT USING (campaign_id IN (
    SELECT id FROM campaigns WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create leads in their campaigns" ON leads
  FOR INSERT WITH CHECK (campaign_id IN (
    SELECT id FROM campaigns WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  ));

-- RLS policy: Users can see email logs for their leads
CREATE POLICY "Users can see email logs" ON email_logs
  FOR SELECT USING (lead_id IN (
    SELECT id FROM leads WHERE campaign_id IN (
      SELECT id FROM campaigns WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  ));

-- RLS policy: Users can see replies for their leads
CREATE POLICY "Users can see replies" ON replies
  FOR SELECT USING (lead_id IN (
    SELECT id FROM leads WHERE campaign_id IN (
      SELECT id FROM campaigns WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  ));

-- RLS policy: Users can see booked calls for their leads
CREATE POLICY "Users can see booked calls" ON booked_calls
  FOR SELECT USING (lead_id IN (
    SELECT id FROM leads WHERE campaign_id IN (
      SELECT id FROM campaigns WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  ));

-- RLS policy: Users can see SMTP credentials in their workspaces
CREATE POLICY "Users can see smtp credentials" ON smtp_credentials
  FOR SELECT USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can create smtp credentials" ON smtp_credentials
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));
