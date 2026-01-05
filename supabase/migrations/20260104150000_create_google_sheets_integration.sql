-- Create Google Sheets integration table
CREATE TABLE IF NOT EXISTS google_sheets_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Integration details
  module_name TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  spreadsheet_name TEXT,
  sheet_name TEXT,

  -- OAuth credentials (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,

  -- Sync settings
  auto_sync BOOLEAN DEFAULT false,
  sync_frequency TEXT DEFAULT 'manual', -- 'manual', 'hourly', 'daily', 'weekly'
  last_synced_at TIMESTAMPTZ,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, module_name, spreadsheet_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_sheets_integrations_org_module
  ON google_sheets_integrations(organization_id, module_name);

CREATE INDEX IF NOT EXISTS idx_google_sheets_integrations_active
  ON google_sheets_integrations(organization_id, is_active);

-- Create sync history table
CREATE TABLE IF NOT EXISTS google_sheets_sync_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES google_sheets_integrations(id) ON DELETE CASCADE,

  -- Sync details
  sync_type TEXT NOT NULL, -- 'manual', 'automatic'
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  rows_synced INTEGER DEFAULT 0,
  error_message TEXT,

  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for sync history
CREATE INDEX IF NOT EXISTS idx_google_sheets_sync_history_integration
  ON google_sheets_sync_history(integration_id, synced_at DESC);

-- Enable RLS
ALTER TABLE google_sheets_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sheets_sync_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_sheets_integrations
CREATE POLICY "Users can view integrations from their organization"
  ON google_sheets_integrations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create integrations for their organization"
  ON google_sheets_integrations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'gestor')
    )
  );

CREATE POLICY "Users can update their organization's integrations"
  ON google_sheets_integrations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'gestor')
    )
  );

CREATE POLICY "Users can delete their organization's integrations"
  ON google_sheets_integrations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'gestor')
    )
  );

-- RLS Policies for google_sheets_sync_history
CREATE POLICY "Users can view sync history from their organization"
  ON google_sheets_sync_history FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM google_sheets_integrations
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert sync history"
  ON google_sheets_sync_history FOR INSERT
  WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_google_sheets_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_google_sheets_integrations_updated_at
  BEFORE UPDATE ON google_sheets_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_google_sheets_integrations_updated_at();

-- Comments
COMMENT ON TABLE google_sheets_integrations IS 'Stores Google Sheets integration configurations for each module';
COMMENT ON TABLE google_sheets_sync_history IS 'Tracks history of data synchronizations with Google Sheets';
