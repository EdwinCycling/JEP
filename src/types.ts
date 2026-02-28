export interface JEPFeaturesets {
  featureset?: string | string[];
}

export interface JEPProperty {
  "@_name": string;
  "@_type": string;
  "@_caption": string;
  "@_columnname"?: string;
  "@_length"?: string;
  "@_allowempty"?: string;
  "@_unique"?: string;
  "@_iscode"?: string;
  "@_isdescription"?: string;
  "@_refersto"?: string;
  "@_referstocustomentity"?: string;
  "@_translationid"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
  listitems?: {
    "@_allowempty"?: string;
    "@_listdefinitionid"?: string;
    listitem?: {
      "@_value": string;
      "@_caption": string;
      "@_translationid"?: string;
    }[];
  };
}

export interface JEPEntity {
  "@_name": string;
  "@_table"?: string;
  "@_extensiontable"?: string;
  "@_businesscomponent"?: string;
  "@_description"?: string;
  "@_descriptionplural"?: string;
  "@_translationid"?: string;
  "@_translationpluralid"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  property?: JEPProperty[];
}

export interface JEPField {
  "@_id"?: string;
  "@_datafield"?: string;
  "@_type"?: string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_length"?: string;
  "@_datasource"?: string;
  "@_existing"?: string;
  "@_controltype"?: string;
  "@_referstocustomentity"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
  mandatorylegislation?: string;
  documentation?: string;
}

export interface JEPCardSection {
  "@_id": string;
  "@_existing"?: string;
  "@_caption"?: string;
  "@_positionbefore"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
  field?: JEPField[];
}

export interface JEPContentSectionRow {
  "@_id": string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
  field?: JEPField[];
}

export interface JEPGridPageHeaderSection {
  "@_id": string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
  field?: JEPField[];
}

export interface JEPGridPageHeader {
  section?: JEPGridPageHeaderSection[];
}

export interface JEPGridColumn {
  "@_id"?: string;
  "@_datafield"?: string;
  "@_field"?: string;
  "@_type"?: string;
  "@_length"?: string;
  "@_width"?: string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_datasource"?: string;
  "@_positionbefore"?: string;
  "@_existing"?: string;
  "@_showreference"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
}

export interface JEPFilter {
  "@_id": string;
  "@_type"?: string;
  "@_length"?: string;
  "@_caption"?: string;
  "@_translationid"?: string;
  "@_captionid"?: string;
  "@_existing"?: string;
  "@_controltype"?: string;
  "@_listdefinitionid"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
}

export interface JEPFilterBlock {
  "@_id"?: string;
  "@_existing"?: string;
  filter?: JEPFilter[];
}

export interface JEPColumnGroupColumn {
  "@_id"?: string;
  "@_field": string;
  "@_filterid"?: string;
  "@_type"?: string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_controltype"?: string;
  "@_listdefinitionid"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  visibleexpression?: string;
  documentation?: string;
}

export interface JEPColumnGroup {
  "@_id": string;
  "@_existing"?: string;
  join?: {
    "@_extensiontable": string;
    "@_forcolumn"?: string;
  };
  column?: JEPColumnGroupColumn[];
}

export interface JEPButton {
  "@_id": string;
  "@_caption"?: string;
  "@_href"?: string;
  "@_positionbefore"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
}

export interface JEPMonitorItem {
  "@_caption"?: string;
  "@_image"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
}

export interface JEPMonitor {
  "@_existing"?: string;
  item?: JEPMonitorItem[];
}

export interface JEPApplicationExtension {
  "@_application"?: string;
  "@_entity"?: string;
  "@_pagetype"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  cardsection?: JEPCardSection[];
  contentsectionrow?: JEPContentSectionRow[];
  gridpageheader?: JEPGridPageHeader[];
  gridcolumn?: JEPGridColumn[];
  filterblock?: JEPFilterBlock[];
  columngroup?: JEPColumnGroup[];
  button?: JEPButton[];
  monitor?: JEPMonitor;
}

export interface JEPTranslationLanguage {
  "@_code": string;
  "#text": string;
}

export interface JEPTranslation {
  "@_id": string;
  language?: JEPTranslationLanguage[];
}

export interface JEPMegaMenuLink {
  "@_id": string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_href"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
}

export interface JEPPowerBILink {
  "@_id": string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
  powerbireportembedlink: string;
  pagetitle?: string;
}

export interface JEPMegaMenuSubsection {
  "@_id": string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
  link?: JEPMegaMenuLink | JEPMegaMenuLink[];
  powerbilink?: JEPPowerBILink | JEPPowerBILink[];
}

export interface JEPMegaMenuSection {
  "@_id": string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
  subsection?: JEPMegaMenuSubsection | JEPMegaMenuSubsection[];
}

export interface JEPMegaMenuTab {
  "@_id": string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
  section?: JEPMegaMenuSection | JEPMegaMenuSection[];
}

export interface JEPMegaMenuExtension {
  "@_menuid": string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  tab?: JEPMegaMenuTab | JEPMegaMenuTab[];
}

export interface JEPQuickMenuSubsection {
  "@_id": string;
  "@_caption"?: string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  visibleexpression?: string;
  link?: JEPMegaMenuLink | JEPMegaMenuLink[];
  powerbilink?: JEPPowerBILink | JEPPowerBILink[];
}

export interface JEPQuickMenuExtension {
  "@_menuid": string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  subsection?: JEPQuickMenuSubsection | JEPQuickMenuSubsection[];
}

export interface JEPDivisionSetting {
  "@_id": string;
  "@_caption": string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_type": 'boolean' | 'integer' | 'string' | 'double' | 'date';
  "@_defaultvalue"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
}

export interface JEPDivisionSettingsSection {
  "@_id": string;
  "@_caption": string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  setting?: JEPDivisionSetting | JEPDivisionSetting[];
}

export interface JEPDivisionSettingsTab {
  "@_id": string;
  "@_caption": string;
  "@_captionid"?: string;
  "@_translationid"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  mandatorylegislation?: string;
  section?: JEPDivisionSettingsSection | JEPDivisionSettingsSection[];
}

export interface JEPDivisionSettingsExtensions {
  tab?: JEPDivisionSettingsTab | JEPDivisionSettingsTab[];
}

export interface JEPRoleCustomEntity {
  "@_name": string;
  "@_permission": string;
}

export interface JEPExistingRole {
  "@_id": string;
  customentity?: JEPRoleCustomEntity | JEPRoleCustomEntity[];
}

export interface JEPRoles {
  existingrole?: JEPExistingRole | JEPExistingRole[];
}

export interface JEPModel {
  extension?: {
    "@_code": string;
    "@_version": string;
    customentities?: {
      customentity?: JEPEntity[];
    };
    entities?: {
      entity?: JEPEntity[];
    };
    workflowdefinitions?: {
      workflowdefinition?: JEPWorkflowDefinition[];
    };
    megamenuextensions?: {
      megamenuextension?: JEPMegaMenuExtension[];
    };
    quickmenuextensions?: {
      quickmenuextension?: JEPQuickMenuExtension[];
    };
    roles?: JEPRoles;
    applicationextensions?: {
      applicationextension?: JEPApplicationExtension[];
    };
    divisionsettingsextensions?: JEPDivisionSettingsExtensions;
    translationextensions?: {
      translation?: JEPTranslation[];
    };
    [key: string]: any;
  };
}

export interface JEPWorkflowDefinition {
  "@_name": string;
  "@_description"?: string;
  "@_descriptionplural"?: string;
  "@_translationid"?: string;
  "@_translationpluralid"?: string;
  customentity?: JEPEntity;
  stages?: {
    stage?: JEPWorkflowStage[];
  };
}

export interface JEPWorkflowStage {
  "@_name": string;
  "@_caption": string;
  "@_translationid"?: string;
  "@_defaultaction"?: string;
  "@_stagetype"?: 'New' | 'Restarted' | 'Canceled' | 'Final';
  propertysettings?: {
    propertysetting?: JEPWorkflowPropertySetting[];
  };
  actions?: {
    action?: JEPWorkflowAction[];
  };
  editpermissions?: JEPWorkflowPermissions;
  deletepermissions?: JEPWorkflowPermissions;
}

export interface JEPWorkflowPropertySetting {
  "@_property": string;
  "@_mandatory"?: string;
  "@_visible"?: string;
  "@_enabled"?: string;
}

export interface JEPWorkflowAction {
  "@_name": string;
  "@_caption": string;
  "@_translationid"?: string;
  "@_tostage": string;
  permissions?: JEPWorkflowPermissions;
  skip?: {
    "@_tostage": string;
    condition: string;
  };
  automations?: {
    automation?: JEPWorkflowAutomation[];
  };
}

export interface JEPWorkflowPermissions {
  user?: JEPWorkflowUserPermission | JEPWorkflowUserPermission[];
  team?: JEPWorkflowTeamPermission | JEPWorkflowTeamPermission[];
  actor?: JEPWorkflowActorPermission | JEPWorkflowActorPermission[];
}

export interface JEPWorkflowUserPermission {
  "@_involvementtype": 'Creator' | 'AccountManager' | 'ProjectManager' | 'Employee' | 'EmployeeManager' | 'User' | 'UserManager';
  "@_property"?: string;
  "@_customentityproperty"?: string;
}

export interface JEPWorkflowTeamPermission {
  "@_code": string;
}

export interface JEPWorkflowActorPermission {
  "@_involvementtype": 'User';
  "@_action": string;
}

export interface JEPWorkflowAutomation {
  "@_action": string;
  "@_description"?: string;
}
