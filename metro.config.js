const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

const wrapped = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});

const srcDir = path.resolve(__dirname, "src");
const nativewindResolve = wrapped.resolver.resolveRequest;

wrapped.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    const realPath = path.join(srcDir, moduleName.slice(2));
    return context.resolveRequest(context, realPath, platform);
  }
  return nativewindResolve(context, moduleName, platform);
};

module.exports = wrapped;
