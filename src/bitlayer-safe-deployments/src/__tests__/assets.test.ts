import fs from "fs";
import path from "path";

function assetPath(...paths: string[]) {
  return path.join(__dirname, "..", "assets", ...paths);
}

function versions() {
  const files = fs.readdirSync(assetPath());
  return files.filter((file) => file.match(/^v[0-9]+\.[0-9]+\.[0-9]+$/));
}

function versionFiles(version: string) {
  const files = fs.readdirSync(assetPath(version));
  return files.filter((file) => file.match(/.*\.json$/));
}

async function readAsset(version: string, file: string) {
  return await fs.promises.readFile(assetPath(version, file), "utf-8");
}

async function readAssetJSON(version: string, file: string) {
  return JSON.parse(await readAsset(version, file));
}

describe("assets/", () => {
  for (const version of versions()) {
    describe(version, () => {
      for (const file of versionFiles(version)) {
        describe(file, () => {
          describe("networkAddresses", () => {
            it("should be sorted by chain ID", async () => {
              // We manually parse the JSON here, since ECMA `JSON.parse` will
              // always order fields with numeric keys.
              const json = await readAsset(version, file);
              const networkAddresses = json
                .replace(
                  /^[\s\S]*"networkAddresses" *: *\{([^}]*)\}[\s\S]*$/,
                  "$1"
                )
                .trim();
              const keys = networkAddresses.split(",").map((pair) => {
                const [key] = pair.split(":");
                return parseInt(key.trim().replace(/^"(.*)"$/, "$1"));
              });
              const sorted = [...keys].sort((a, b) => a - b);
              expect(keys).toEqual(sorted);
            });

            it("should only contain canonical addresses", async () => {
              const { networkAddresses } = await readAssetJSON(version, file);
              const canonicalAddresses = [
                // Ethereum Mainnet address
                networkAddresses[1],
                // For v1.3.0, support alternate address with different
                // `CREATE2` deployer, notably used for Optimism Mainnet
                ...(version === "v1.3.0" ? [networkAddresses[10]] : []),
                // zkSync Mainnet address
                networkAddresses[324],
              ].filter((address) => address !== undefined);

              for (const [network, address] of Object.entries(
                networkAddresses
              )) {
                expect(
                  canonicalAddresses.map((address) => [network, address])
                ).toContainEqual([network, address]);
              }
            });
          });
        });
      }

      describe("networkAddresses", () => {
        it("should contain the same networks in all files", async () => {
          const files = versionFiles(version);
          const networkCounts: Record<string, number> = {};
          for (const file of files) {
            const { networkAddresses } = await readAssetJSON(version, file);
            for (const network of Object.keys(networkAddresses)) {
              networkCounts[network] = (networkCounts[network] ?? 0) + 1;
            }
          }
          for (const [network, count] of Object.entries(networkCounts)) {
            expect([network, count]).toEqual([network, files.length]);
          }
        });
      });
    });
  }
});
