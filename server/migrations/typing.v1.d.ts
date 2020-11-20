

export type ObjectName = string;
export type ApplicationKey = ObjectName;
export type TableKey = { name: ObjectName; application?: ObjectName };
export type FieldKey = { name: ObjectName; table: TableKey };
export type IndexKey = { name: ObjectName; table: TableKey };

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

interface Dict<T> {
  [key: string]: T;
}

export declare namespace SchemaArguments {
  export interface DeleteById {
    readonly id: string;
  }

  /*
    Applications interfaces
   */

  interface ApplicationData {
    readonly name: string;
    readonly displayName?: string;
    readonly description?: string;
    readonly status?: "ACTIVE" | "INACTIVE";
  }

  export interface ApplicationCreate extends ApplicationData {
    readonly id: string;
  }

  export interface ApplicationUpdateById extends Partial<ApplicationData> {
    readonly id: string;
  }

  export interface ApplicationUpdate extends Partial<ApplicationData> {
    readonly application: ApplicationKey;
  }

  export interface ApplicationDelete {
    readonly application: ApplicationKey;
  }

  /*
    Tables interfaces
   */
  interface TableData {
    readonly name: string;
    readonly displayName?: string;
    readonly description?: string;
  }

  export interface TableCreate extends TableData {
    readonly id: string;
    readonly applicationId?: string;
    readonly application?: ObjectName;
  }

  export interface TableDelete {
    readonly table: { name: ObjectName; application: ObjectName };
  }

  export interface TableUpdateById extends Partial<TableData> {
    readonly id: string;
  }

  export interface TableUpdate extends Partial<TableData> {
    readonly table: TableKey;
  }

  /*
    Fields interfaces
   */

  interface FieldDataBase {
    readonly name: string;
    readonly displayName?: string;
    readonly description?: string;
    readonly defaultValue?: string | null;

    readonly isRequired: boolean;
    readonly isList: boolean;
    readonly isUnique?: boolean;

    readonly computedMode?: "VIRTUAL" | "STORED";
    readonly expression?: string;
    readonly references?: string[];
  }

  interface NumberFieldTypeAttributes {
    readonly format: "NUMBER";
    readonly precision?: number;
    readonly currency?: string;
    readonly minValue?: number;
    readonly maxValue?: number;
    readonly isBigInt?: boolean;
    readonly autoIncrement?: boolean;
  }

  interface TextFieldTypeAttributes {
    readonly format: "UNFORMATTED" | "NAME" | "EMAIL" | "EIN";
    readonly fieldSize?: number;
    readonly regex?: string;
  }

  interface DateFieldTypeAttributes {
    readonly format: "DATE" | "DATETIME";
  }

  interface SwitchFieldTypeAttributes {
    readonly format: "ON_OFF" | "YES_NO" | "TRUE_FALSE" | "ACTIVE_INACTIVE" | "HIGH_LOW" | "CUSTOM";
    readonly listOptions?: string[];
  }

  interface SmartFieldTypeAttributes {
    readonly format: "ADDRESS" | "PHONE";
    readonly innerFields?: NumberFieldData | SwitchFieldData | TextFieldData | DateFieldData[];
  }

  interface FileFieldTypeAttributes {
    readonly format: "FILE" | "IMAGE";
    readonly showTitle?: boolean;
    readonly showUrl?: boolean;
    readonly maxSize?: number;
    readonly typeRestrictions?: string[];
    readonly expiration?: number;
  }

  interface NumberFieldData extends FieldDataBase {
    readonly fieldType: "NUMBER";
    readonly fieldTypeAttributes?: NumberFieldTypeAttributes;
  }

  interface SwitchFieldData extends FieldDataBase {
    readonly fieldType: "SWITCH";
    readonly fieldTypeAttributes: SwitchFieldTypeAttributes;
  }

  interface TextFieldData extends FieldDataBase {
    readonly fieldType: "TEXT";
    readonly fieldTypeAttributes: TextFieldTypeAttributes;
  }

  interface DateFieldData extends FieldDataBase {
    readonly fieldType: "DATE";
    readonly fieldTypeAttributes: DateFieldTypeAttributes;
  }

  interface SmartFieldData extends FieldDataBase {
    readonly fieldType: "SMART";
    readonly fieldTypeAttributes: SmartFieldTypeAttributes;
  }

  interface JsonFieldData extends FieldDataBase {
    readonly fieldType: "JSON";
  }

  interface FileFieldData extends FieldDataBase {
    readonly fieldType: "FILE";
    readonly fieldTypeAttributes: FileFieldTypeAttributes;
    readonly relation: ImplicitRelationData;
  }

  interface RelationFieldData extends FieldDataBase {
    readonly fieldType: "RELATION";
    readonly relation: ImplicitRelationData;
  }

  interface ImplicitRelationData {
    readonly refTableId: string;
    readonly refFieldName?: string;
    readonly refFieldDisplayName?: string;
    readonly refFieldIsList: boolean;
    readonly refFieldIsRequired: boolean;
    readonly id: string;
  }

  type FieldData =
    | RelationFieldData
    | FileFieldData
    | JsonFieldData
    | SmartFieldData
    | DateFieldData
    | TextFieldData
    | NumberFieldData
    | SwitchFieldData;

  type FieldDataPartial =
    | RecursivePartial<RelationFieldData>
    | RecursivePartial<FileFieldData>
    | RecursivePartial<JsonFieldData>
    | RecursivePartial<SmartFieldData>
    | RecursivePartial<DateFieldData>
    | RecursivePartial<TextFieldData>
    | RecursivePartial<NumberFieldData>
    | RecursivePartial<SwitchFieldData>;

  export type FieldCreateById = FieldData & {
    readonly id: string;
    readonly tableId: string;
  };

  export type FieldCreate = FieldData & {
    readonly id: string;
    readonly table: TableKey;
  };

  export interface FieldDelete {
    readonly field: FieldKey;
  }

  export type FieldUpdateById = FieldDataPartial & {
    readonly id: string;
  };

  export type FieldUpdate = FieldDataPartial & {
    readonly field: FieldKey;
  };

  /*
    Indexes interfaces
   */

  export interface ITableIndexColumnData {
    name: string;
    direction?: "DESC" | "ASC";
  }

  export interface MigrationSchemaIndexData {
    readonly name: string;
    readonly type: "INDEX" | "UNIQUE";
    readonly columns: ITableIndexColumnData[];
    readonly force?: boolean;
  }

  export interface MigrationSchemaIndexCreateById extends MigrationSchemaIndexData {
    readonly id: string;
    readonly tableId: string;
  }

  export interface MigrationSchemaIndexCreate extends MigrationSchemaIndexData {}

  export interface MigrationSchemaIndexDelete {
    readonly index: IndexKey;
  }

  export interface MigrationSchemaIndexUpdate extends Partial<MigrationSchemaIndexData> {
    readonly index: IndexKey;
  }

  export interface MigrationSchemaIndexUpdateById extends Partial<MigrationSchemaIndexData> {
    readonly id: string;
  }
}

export declare namespace DataArguments {
  export namespace MigrationDataInputTypes {
    type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
      {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
      }[Keys];

    export type RelationLink<Keys extends string, Values extends string = string> = RequireAtLeastOne<
      { id: string } & { [k in Keys]: Values }
    >;

    export type RelationConnect<Keys extends string = string, Values extends string = string> = {
      connect: RelationLink<Keys, Values> | RelationLink<Keys, Values>[];
    };

    export type RelationReconnect<Keys extends string = string> = {
      reconnect: RelationLink<Keys> | RelationLink<Keys>[];
    };
    export type RelationDisconnect<Keys extends string = string> = {
      disconnect: RelationLink<Keys> | RelationLink<Keys>[];
    };
    export type RelationCreate<DataT> = { create: DataT };

    export type JsonFieldType = object;
    export type ScalarFieldTypes = string | number | boolean | Date | JsonFieldType;

    export type TableCreate = Dict<ScalarFieldTypes | RelationCreate<TableCreate> | RelationConnect>;
    export type TableUpdate = Dict<
      ScalarFieldTypes | RelationCreate<TableUpdate> | RelationConnect | RelationReconnect | RelationDisconnect
    >;

    export type Filter<Keys extends string = string> = RequireAtLeastOne<{ id: string } & { [k in Keys] : string }>;
  }

  export interface MigrationDataCreateInput {
    readonly table: TableKey;
    readonly data: MigrationDataInputTypes.TableCreate;
  }

  export interface MigrationDataUpdateInput {
    readonly table: TableKey;
    readonly filter: MigrationDataInputTypes.Filter;
    readonly data: MigrationDataInputTypes.TableUpdate;
  }

  export interface MigrationDataDeleteInput {
    readonly table: TableKey;
    readonly filter: MigrationDataInputTypes.Filter;
  }
}

interface DataApi {
  create: (data: DataArguments.MigrationDataCreateInput) => Promise<void>;
  update: (data: DataArguments.MigrationDataUpdateInput) => Promise<void>;
  delete: (data: DataArguments.MigrationDataDeleteInput) => Promise<void>;
}

interface SchemaApplicationApi {
  create: (data: SchemaArguments.ApplicationCreate) => Promise<void>;
  delete: (data: SchemaArguments.ApplicationDelete | SchemaArguments.DeleteById) => Promise<void>;
  update: (data: SchemaArguments.ApplicationUpdate | SchemaArguments.ApplicationUpdateById) => Promise<void>;
}

export interface SchemaIndexApi {
  create: (
    data: SchemaArguments.MigrationSchemaIndexCreate | SchemaArguments.MigrationSchemaIndexCreateById,
  ) => Promise<void>;
  delete: (data: SchemaArguments.MigrationSchemaIndexDelete | SchemaArguments.DeleteById) => Promise<void>;
  update: (
    data: SchemaArguments.MigrationSchemaIndexUpdate | SchemaArguments.MigrationSchemaIndexUpdateById,
  ) => Promise<void>;
}

export interface SchemaFieldApi {
  create: (data: SchemaArguments.FieldCreate | SchemaArguments.FieldCreateById) => Promise<void>;
  delete: (data: SchemaArguments.FieldDelete | SchemaArguments.DeleteById) => Promise<void>;
  update: (data: SchemaArguments.FieldUpdate | SchemaArguments.FieldUpdateById) => Promise<void>;
}

export interface SchemaTableApi {
  create: (data: SchemaArguments.TableCreate) => Promise<void>;
  delete: (data: SchemaArguments.TableDelete | SchemaArguments.DeleteById) => Promise<void>;
  update: (data: SchemaArguments.TableUpdate | SchemaArguments.TableUpdateById) => Promise<void>;
}

interface SchemaApi {
  application: SchemaApplicationApi;
  table: SchemaTableApi;
  field: SchemaFieldApi;
  index: SchemaIndexApi;
}

type DocumentNode = object;
type GqlRequest = <Result = {}, Variables = {}>(query: DocumentNode | string, variables?: Variables) => Promise<Result>;

export interface Context {
  schema: SchemaApi;
  data: DataApi;
  gqlRequest: GqlRequest;
}

export type MigrationVersion = "v1";
