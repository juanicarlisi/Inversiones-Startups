// Metro: los textos bíblicos (.bib) se empaquetan como recursos, no como módulos JS, para no inflar el bundle.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("bib");

module.exports = config;
