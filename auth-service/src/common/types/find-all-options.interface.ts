export interface FindAllOptions {
  /** Enable population of related fields */
  enablePopulate?: boolean;

  /** Fields to select (MongoDB projection syntax) */
  select?: string;

  /** Whether to include password field (default: false) */
  withPassword?: boolean;

  /** Include soft-deleted records (default: false) */
  withDeleted?: boolean;

  /** Specify which fields to populate */
  populationFields?: string[];

  /** Maximum items per page (default: 100) */
  maxLimit?: number;

  /** Return plain JavaScript objects instead of Mongoose documents (default: false) */
  lean?: boolean;

  /** Custom sort object to override query sort */
  customSort?: Record<string, 1 | -1>;

  treeView?: boolean; // If true, only fetch top-level data for tree view
}
