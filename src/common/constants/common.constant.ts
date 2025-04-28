export const FolderPath = {
  USERS: 'uploads/images/users',
  EXAMPLES: 'uploads/images/examples',
} as const satisfies Record<string, string>;

export const ImagePath = {
  USERS: 'images/users',
  EXAMPLES: 'images/examples',
} as const satisfies Record<string, string>;

export const ModelName = {
  USERS: 'users',
  EXAMPLES: 'examples',
} as const satisfies Record<string, string>;