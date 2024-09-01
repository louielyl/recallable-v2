export const cardQueryKey = {
	all: ["card"] as const,
	items: () => [...cardQueryKey.all, "item"] as const,
	itemById: (id: string) => [...cardQueryKey.items(), id] as const,
	itemByContents: () => [...cardQueryKey.all, "item-by-content"] as const,
	itemByContent: (content: string) => [...cardQueryKey.itemByContents(), content] as const,
}

export const headWordQueryKey = {
	all: ["headWord"] as const,
	items: () => [...headWordQueryKey.all, "item"] as const,
	itemById: (id: string) => [...headWordQueryKey.items(), id] as const,
	itemByContents: () => [...headWordQueryKey.all, "item-by-content"] as const,
	itemByContent: (content: string) => [...headWordQueryKey.itemByContents(), content] as const,
}

export const definitionQueryKey = {
	all: ["definition"] as const,
	items: () => [...definitionQueryKey.all, "item"] as const,
	itemById: (id: string) => [...definitionQueryKey.items(), id] as const,
}

export const headWordDefinitionMappingQueryKey = {
	all: ["headWordDefinitionMapping"] as const,
	items: () => [...headWordDefinitionMappingQueryKey.all, "item"] as const,
	itemById: (id: string) => [...headWordDefinitionMappingQueryKey.items(), id] as const,
	itemByContents: () => [...headWordDefinitionMappingQueryKey.all, "item-by-content"] as const,
	itemByContent: (content: string) => [...headWordDefinitionMappingQueryKey.itemByContents(), content] as const,
}

export const fsrsQueryKey = {
	all: ["fsrs"] as const,
	parameters: () => [...fsrsQueryKey.all, "parameters"] as const,
}
