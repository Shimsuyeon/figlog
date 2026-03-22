import path from "node:path";
import type { Plugin } from "vite";

export interface AutoLogPluginOptions {
  /**
   * How many levels up from the file to extract the folder name.
   * 1 = immediate parent folder (default).
   */
  folderDepth?: number;
  /** Regex to include files. Defaults to /\.(tsx|jsx)$/ */
  include?: RegExp;
  /** Regex to exclude files */
  exclude?: RegExp;
}

const DATA_LOG_RE = /data-log\s*=\s*['"](?:click|view)['"]/g;

function extractMeta(filePath: string, folderDepth: number) {
  const parsed = path.parse(filePath);
  const fileName = parsed.name;

  const segments = parsed.dir.split(path.sep).filter(Boolean);
  const folder = segments[segments.length - folderDepth] ?? segments[segments.length - 1] ?? "";

  return { fileName, folder };
}

export default function autoLogPlugin(
  options: AutoLogPluginOptions = {},
): Plugin {
  const {
    folderDepth = 1,
    include = /\.(tsx|jsx)$/,
    exclude,
  } = options;

  return {
    name: "vite-plugin-auto-log",
    enforce: "pre",

    transform(code, id) {
      if (!include.test(id)) return null;
      if (exclude?.test(id)) return null;
      if (!code.includes("data-log=")) return null;

      const { fileName, folder } = extractMeta(id, folderDepth);

      const transformed = code.replace(DATA_LOG_RE, (match) => {
        return `${match} data-log-component='${fileName}' data-log-folder='${folder}'`;
      });

      if (transformed === code) return null;

      return { code: transformed, map: null };
    },
  };
}
