import { 
  LibraryDefinition,
  LibraryDefinitionListResult,
  LibraryDefinitionsListRequest,
} from "@internal/plugin-api-platform-common";

export interface LibraryService {

  // api-platform frontend
  
  listLibraries(request: LibraryDefinitionsListRequest): Promise<LibraryDefinitionListResult>;

  getLibraryVersions(request: { system: string, libraryName: string }): Promise<LibraryDefinition[]>;

}