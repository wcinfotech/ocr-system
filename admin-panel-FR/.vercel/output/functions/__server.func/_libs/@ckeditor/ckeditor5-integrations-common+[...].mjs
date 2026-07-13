//#region node_modules/@ckeditor/ckeditor5-integrations-common/dist/index.js
function createDefer() {
	const deferred = {
		resolve: null,
		promise: null
	};
	deferred.promise = new Promise((resolve) => {
		deferred.resolve = resolve;
	});
	return deferred;
}
function once(fn) {
	let lastResult = null;
	return (...args) => {
		if (!lastResult) lastResult = { current: fn(...args) };
		return lastResult.current;
	};
}
var HEX_NUMBERS = new Array(256).fill("").map((_, index) => ("0" + index.toString(16)).slice(-2));
function uid() {
	const [r1, r2, r3, r4] = crypto.getRandomValues(/* @__PURE__ */ new Uint32Array(4));
	return "e" + HEX_NUMBERS[r1 >> 0 & 255] + HEX_NUMBERS[r1 >> 8 & 255] + HEX_NUMBERS[r1 >> 16 & 255] + HEX_NUMBERS[r1 >> 24 & 255] + HEX_NUMBERS[r2 >> 0 & 255] + HEX_NUMBERS[r2 >> 8 & 255] + HEX_NUMBERS[r2 >> 16 & 255] + HEX_NUMBERS[r2 >> 24 & 255] + HEX_NUMBERS[r3 >> 0 & 255] + HEX_NUMBERS[r3 >> 8 & 255] + HEX_NUMBERS[r3 >> 16 & 255] + HEX_NUMBERS[r3 >> 24 & 255] + HEX_NUMBERS[r4 >> 0 & 255] + HEX_NUMBERS[r4 >> 8 & 255] + HEX_NUMBERS[r4 >> 16 & 255] + HEX_NUMBERS[r4 >> 24 & 255];
}
function mapObjectKeys(obj, fn) {
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [fn(key), value]));
}
function kebabToCamelCase(str) {
	return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}
function isSemanticVersion(version) {
	return !!version && /^\d+\.\d+\.\d+/.test(version);
}
function destructureSemanticVersion(version) {
	if (!isSemanticVersion(version)) throw new Error(`Invalid semantic version: ${version || "<blank>"}.`);
	const [major, minor, patch] = version.split(".");
	return {
		major: Number.parseInt(major, 10),
		minor: Number.parseInt(minor, 10),
		patch: Number.parseInt(patch, 10)
	};
}
function compareSemanticVersions(a, b) {
	const parsedA = destructureSemanticVersion(a);
	const parsedB = destructureSemanticVersion(b);
	return Math.sign(parsedA.major - parsedB.major || parsedA.minor - parsedB.minor || parsedA.patch - parsedB.patch);
}
function isCKTestingVersion(version) {
	if (!version) return false;
	return [
		"nightly",
		"alpha",
		"internal",
		"nightly-",
		"staging"
	].some((testVersion) => version.includes(testVersion));
}
function isCKZeroBaseVersion(version) {
	return !!version?.startsWith("0.0.0-");
}
function isCKVersion(version) {
	return isSemanticVersion(version) || isCKTestingVersion(version);
}
function appendExtraPluginsToEditorConfig(config, plugins) {
	const extraPlugins = config.extraPlugins || [];
	return {
		...config,
		extraPlugins: [...extraPlugins, ...plugins.filter((item) => !extraPlugins.includes(item))]
	};
}
function getLicenseVersionFromEditorVersion(version) {
	if (isCKTestingVersion(version)) return 3;
	const { major } = destructureSemanticVersion(version);
	switch (true) {
		case major >= 44: return 3;
		case major >= 38: return 2;
		default: return 1;
	}
}
function getCKBaseBundleInstallationInfo() {
	const { CKEDITOR_VERSION, CKEDITOR } = window;
	if (!isCKVersion(CKEDITOR_VERSION)) return null;
	return {
		source: CKEDITOR ? "cdn" : "npm",
		version: CKEDITOR_VERSION
	};
}
function getSupportedLicenseVersionInstallationInfo() {
	const installationInfo = getCKBaseBundleInstallationInfo();
	if (!installationInfo) return null;
	return getLicenseVersionFromEditorVersion(installationInfo.version);
}
function isCKEditorFreeLicense(licenseKey, licenseVersion) {
	licenseVersion ||= getSupportedLicenseVersionInstallationInfo() || void 0;
	switch (licenseVersion) {
		case 1:
		case 2: return licenseKey === void 0;
		case 3: return licenseKey === "GPL";
		default: return false;
	}
}
function createIntegrationUsageDataPlugin(integrationName, usageData) {
	return function IntegrationUsageDataPlugin(editor) {
		if (isCKEditorFreeLicense(editor.config.get("licenseKey"))) return;
		editor.on("collectUsageData", (source, { setUsageData }) => {
			setUsageData(`integration.${integrationName}`, usageData);
		});
	};
}
function compareInstalledCKBaseVersion(version) {
	const installedVersion = getCKBaseBundleInstallationInfo()?.version;
	if (!installedVersion) return null;
	if (isCKZeroBaseVersion(version)) return -1;
	if (!isSemanticVersion(installedVersion) || isCKZeroBaseVersion(installedVersion)) return 1;
	return compareSemanticVersions(installedVersion, version);
}
function getInstalledCKBaseFeatures() {
	const installedVersion = compareInstalledCKBaseVersion("48.0.0");
	const isV48OrNewer = installedVersion !== null && installedVersion >= 0;
	return {
		rootsConfigEntry: isV48OrNewer,
		elementConfigAttachment: isV48OrNewer
	};
}
function assignElementToEditorConfig(Editor, element, config) {
	if (!Editor.editorName || Editor.editorName === "ClassicEditor") return {
		...config,
		attachTo: element
	};
	const mappedConfig = {
		...config,
		roots: {
			...config.roots,
			main: {
				...config.root,
				...config.roots?.main,
				element
			}
		}
	};
	delete mappedConfig.root;
	return mappedConfig;
}
function getInitialDataFromEditorConfig(config) {
	if (getInstalledCKBaseFeatures().rootsConfigEntry) return config.roots?.main?.initialData || config.root?.initialData || config.initialData;
	return config.initialData;
}
function assignInitialDataToEditorConfig(config, data, ignoreConfigInitialData) {
	const supports = getInstalledCKBaseFeatures();
	const configInitialData = ignoreConfigInitialData ? null : getInitialDataFromEditorConfig(config);
	if (supports.rootsConfigEntry) {
		const normalizedConfig = {
			...config,
			roots: {
				...config.roots,
				main: {
					...config.root,
					...config.roots?.main,
					initialData: configInitialData || data || ""
				}
			}
		};
		if (data && configInitialData) console.warn("Editor data should be provided either via the config (`config.root.initialData`) or the component's `data` property, but not both. The configuration value takes precedence.");
		delete normalizedConfig.root;
		delete normalizedConfig.initialData;
		return normalizedConfig;
	}
	if (data && configInitialData) console.warn("Editor data should be provided either via the config (`config.initialData`) or the component's `data` property, but not both. The configuration value takes precedence.");
	return {
		...config,
		initialData: configInitialData || data || ""
	};
}
//#endregion
export { createDefer as a, isCKEditorFreeLicense as c, once as d, uid as f, compareInstalledCKBaseVersion as i, kebabToCamelCase as l, assignElementToEditorConfig as n, createIntegrationUsageDataPlugin as o, assignInitialDataToEditorConfig as r, getInstalledCKBaseFeatures as s, appendExtraPluginsToEditorConfig as t, mapObjectKeys as u };
