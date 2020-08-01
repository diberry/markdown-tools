import { promises as fs, constants as fsconstants } from 'fs'
import Papa from 'PapaParse'
import Path, { delimiter } from 'path'

// open file
// find all metadata, extract into dictionary
// find specific dictionary entry, modify values
// add specific dictionary entry with value

export const alterListOfMarkdownFiles = async (pathToRootOfRepo: any, listOfRelativeFiles: any, options: any) => {

    let statusArray: any = [];

    listOfRelativeFiles.map(async (relativeFileName: any) => {

        //console.log(`file test - ${relativeFileName}`)

        const fullPathToFile = Path.join(pathToRootOfRepo, relativeFileName)

        const openForReadWrite = fsconstants.O_RDWR

        //console.log(`full path - ${fullPathToFile}`)

        if (!fileExists(fullPathToFile, openForReadWrite)) {

            //console.log(`file doesn't exist`)

            statusArray.push({
                status: "fail",
                error: "file doesn't exist or can't be opened"
            })
            //console.log(`file doesn't exist - ${fullPathToFile}`)

            //console.log(`loop status array - ${JSON.stringify(statusArray)}`)
        } else {
            const status = await alterFile(fullPathToFile, options)
            statusArray.push(status)
        }

    })
    //console.log(`statusArray ${statusArray}`)
    return statusArray;
}

export const fileExists = async (fileWithFullPath: any, options?: number) => {
    try {

        const access = await fs.access(fileWithFullPath, options)

        return true;
    } catch (err) {
        return false
    }
}
/*
export const myPath = async () => {

    try {
        const newpath = Path.join(__dirname, "../data/test_copy.md")
        console.log(newpath)

        // @ts-ignore
        const available = await fs.access("C:\\Users\\diberry\\repos\\dina\\markdown-tools\\data\\test_copy1.md", fsconstants.W_OK)

        console.log(available)
    } catch (err) {
        console.log(err)
    }

}
*/
export const alterFile = async (fileWithAbsolutePath: string, options: any) => {

    try {

        if (!fileWithAbsolutePath || !options) return;

        const fileContent = await fs.readFile(fileWithAbsolutePath, { encoding: "utf-8" })

        if (!fileContent) return;

        const metadata = getMetadataFromMarkdown(fileContent)
        const metadataDictionary = stringToList(metadata)

        const alteredMetadataObjects = alterMetadata(metadataDictionary, options)

        // TBD - fix this by creating a top level options that is above metadata changes
        const surroundingDelimiter = options[0].surroundingDelimiter

        const alteredMetadataAsString = convertObjArrayToString(metadataDictionary, options.delimiter, options.endOfItemDelimiter)

        const newFileContent = replaceExistingMetadata(fileContent, alteredMetadataAsString, surroundingDelimiter)

        if (options.overwriteFile) {
            const writeFileResponse = await fs.writeFile(fileWithAbsolutePath, newFileContent)
        } else {
            throw Error("Create new file is not enabled")
        }

        return { status: "success", file: fileWithAbsolutePath }
    } catch (err) {
        return { status: "fail", file: fileWithAbsolutePath, err }
    }
}

export const convertObjArrayToString = (objArr: any, nameValuedelimiter: any, endOfItemDelimiter: any) => {

    let newString = "";

    if (!objArr || objArr.length === 0) return newString;

    objArr.map((obj: any) => {
        newString += `${obj.property}${nameValuedelimiter} ${obj.value}${endOfItemDelimiter}`
    })

    return `${newString}`;

}
// return index pos of last char of delimiter
// to insert before delimiter, subtract length of delimiter
// to insert after delimiter, do nothing
export const findDelimiterStartPosition = (sourceStr: string, delimiter: string): any => {

    if (!sourceStr || !delimiter) return [];

    const regEx = new RegExp(delimiter, 'gism');

    let results = new Array();

    while (regEx.exec(sourceStr)) {
        results.push(regEx.lastIndex);
    }

    return results
}

// keep existing delimiter in place
// rip out metadata
export const replaceExistingMetadata = (fileContent: string, alteredMetadata: String, surroundingDelimiter: any): string => {

    const posAllDelimiters = findDelimiterStartPosition(fileContent, surroundingDelimiter)
    
    if(!posAllDelimiters || posAllDelimiters.length<2) return fileContent;
    
    // find delimiter in existing content
    const firstMetadataDelimiterLocationBeginsAt = posAllDelimiters[0] - surroundingDelimiter.length;
    const secondMetadataDelimiterLocationEndsAt = posAllDelimiters[1];

    const contentBeforeFirstDelimiter = fileContent.substring(0,firstMetadataDelimiterLocationBeginsAt)
    const contentAfterSecondDelimiter = 
    fileContent.substring(secondMetadataDelimiterLocationEndsAt,fileContent.length)

    const newContent = `${contentBeforeFirstDelimiter}${surroundingDelimiter}${alteredMetadata}${surroundingDelimiter}${contentAfterSecondDelimiter}`;
    
    return newContent;
}

export const alterMetadata = (arrayMetadataObjects: any, options: any):[] => {

    options.map((singleAlterationRequest: any) => {
        switch (singleAlterationRequest.type.toLowerCase()) {
            case "append":

                // find metadata field start position
                const itemIndex = arrayMetadataObjects.findIndex((x: any) => x.property == singleAlterationRequest.field);

                // append new value
                if (itemIndex === -1) {
                    arrayMetadataObjects.push({ property: singleAlterationRequest.field, value: singleAlterationRequest.append })

                } else {

                    if ((typeof arrayMetadataObjects[itemIndex].value).toLowerCase() === 'array') {
                        // parse array and append to end

                        // TBD - fix - this is wrong
                        const newValue = `${arrayMetadataObjects[itemIndex].value}${singleAlterationRequest.delimiter} ${singleAlterationRequest.append}`

                        arrayMetadataObjects[itemIndex].value = newValue
                    } else {
                        // not an array - just change existing value
                        const newValue = `${arrayMetadataObjects[itemIndex].value}${singleAlterationRequest.delimiter} ${singleAlterationRequest.append}`

                        arrayMetadataObjects[itemIndex].value = newValue
                    }


                }
                break;
            default:
                //console.log("no alteration requested")
                break;
        }
    })

    return arrayMetadataObjects;

}
export const getMetadataFromMarkdown = (content: string) => {

    // get metadata
    const metadataRegex = new RegExp('---(.+?)---(.+?)', 'gism')
    const matches = regEx(metadataRegex, content)

    if (!matches || matches.length <= 2) return content;


    // 0 = all content
    // 1 = metadata only
    const metadata = matches[1].trim();

    return metadata;

}
export const regEx = (expression: RegExp, content: any) => {

    const match = expression.exec(content);

    return match
}
export const stringToList = (text: any): any => {

    const config = {
        skipEmptyLines: true
    };

    const arrItems: any = Papa.parse(text, config);

    if (!arrItems || !arrItems?.data) return [];

    const newArr = arrItems.data.map((item: string) => {

        const flattenedText = (typeof item === 'object') ? item[0] : item;

        const nameValuePairObj = stringToNameValuePair(flattenedText)
        return nameValuePairObj
    })

    return newArr;
}
export const stringToNameValuePair = (text: string): any => {
    const arrNameValuePair = text.trim().split(':')
    const trimmedArray = arrNameValuePair.map((x: any) => x.trim())
    return (trimmedArray.length === 2) ? ({ property: trimmedArray[0], value: trimmedArray[1] }) : null
}
export const hasMetadataField = (field: string, content: string): boolean => {
    return (content.includes(field))
}
export const isArray = (value: any): boolean => {
    return Array.isArray(value)
}
export const createField = (field: string, value: string) => {
    return `${field}: ${value}\n`
}
export const appendField = (field: string, currentValues: string, newValue: string) => {
    return (isArray(currentValues)) ? appendToArray(newValue, currentValues) : `${field}: ${currentValues}, ${newValue}`
}
export const appendToArray = (val: any, arr: any) => {
    return arr.split(',').push(val).join(',');
}

