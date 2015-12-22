/**
 * 000Init -- Bootstraps the testing process removing any previous coverage data as necessary.
 */

import fs from 'fs-extra';

if (fs.existsSync('./coverage'))
{
   fs.removeSync('./coverage');
}