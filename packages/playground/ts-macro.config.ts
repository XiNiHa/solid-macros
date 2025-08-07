import solidMacros from "@solid-macros/volar";

export default {
	plugins: [
		solidMacros({
			typedDomJsx: true,
			narrowedShow: true,
		}),
	],
};
