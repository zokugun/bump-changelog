export type Config = {
	heading: HeadingConfig;
	reference?: ReferenceConfig;
	release: {
		template: string;
	};
	unreleased: {
		action: 'remove' | 'retain';
		template: string;
	};
};

export type FootnoteLocationConfig = {
	by: 'footnote';
	separator?: undefined;
};

export type HeadingConfig = {
	style: 'atx' | 'setext';
	separator: SeparatorConfig;
}

export type HeadingLocationConfig = {
	by: 'heading';
	position: 'after' | 'before';
	separator: SeparatorConfig;
};

export type Options = {
	new?: string;
	old?: string;
};

export type Reference = {
	line: string;
	name: string;
}

export type ReferenceConfig<T extends FootnoteLocationConfig | HeadingLocationConfig | SectionLocationConfig = FootnoteLocationConfig | HeadingLocationConfig | SectionLocationConfig> = {
	location: T;
	release: {
		link: string;
		name: string;
	};
	sort: SortConfig;
	unreleased: {
		link: string;
		name: string;
	};
};

export type References = {
	firstIndex: number;
	references: Reference[]
};

export type SectionLocationConfig = {
	by: 'section';
	separator: SeparatorConfig;
};

export type SeparatorConfig = {
	bottom: 'blankline' | 'none';
	top: 'blankline' | 'none';
};

export type SortConfig = {
	mode: 'alphabetical';
	direction: SortDirectionConfig;
} | {
	mode: 'alpha-version';
	direction: {
		alpha: SortDirectionConfig;
		version: SortDirectionConfig;
	};
} | {
	mode: 'none';
	direction?: never;
};

export type SortDirectionConfig = 'asc' | 'desc';
