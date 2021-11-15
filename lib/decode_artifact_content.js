import {unzip as zlibUnzip} from 'zlib'
import {promisify} from "util";

const unzip = promisify(zlibUnzip);


/**
 * Given a artifact body content (which is a BASE64 string), this method will decode it and return a JSON object of it.
 * @param artifactBody
 * @returns {Promise<{}>}
 */
export const decodeArtifactContent = async (artifactBody) => {
  const artifactBodyBuffer = Buffer.from(artifactBody, 'base64');
  const unzippedContent = await unzip(artifactBodyBuffer);

  return JSON.parse(unzippedContent.toString());
}
