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
  field?: JEPField[];
}

export interface JEPContentSectionRow {
  "@_id": string;
  "@_existing"?: string;
  field?: JEPField[];
}

export interface JEPGridPageHeaderSection {
  "@_id": string;
  "@_existing"?: string;
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

export interface JEPFeaturesets {
  featureset?: string | string[];
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
}

export interface JEPMonitorItem {
  "@_caption"?: string;
  "@_image"?: string;
  "@_existing"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
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

export interface JEPMegaMenuExtension {
  "@_id": string;
  "@_parentid"?: string;
  "@_positionbefore"?: string;
  "@_caption"?: string;
  "@_translationid"?: string;
  "@_url"?: string;
  "@_target"?: string;
  "@_featurecheck"?: 'All' | 'Any' | 'None';
  mandatorylegislation?: string;
  mandatoryfeaturesets?: JEPFeaturesets;
  forbiddenfeaturesets?: JEPFeaturesets;
  item?: JEPMegaMenuExtension[];
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
    megamenuextensions?: {
      megamenuextension?: JEPMegaMenuExtension[];
    };
    roles?: JEPRoles;
    applicationextensions?: {
      applicationextension?: JEPApplicationExtension[];
    };
    translationextensions?: {
      translation?: JEPTranslation[];
    };
    // Other root elements like quickmenuextensions, etc.
    [key: string]: any;
  };
}
