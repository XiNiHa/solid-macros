import solidMacros from "@solid-macros/volar";

export default {
	plugins: [
		solidMacros({
			narrowedShow: true,
			narrowedSwitch: true,
			typedDomJsx: true,
			unwrappedAccessors: true,
		}),
	],
};
