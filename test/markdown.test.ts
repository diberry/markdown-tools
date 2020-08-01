import { alterFile, alterMetadata, regEx, hasMetadataField, isArray, stringToList, stringToNameValuePair, getMetadataFromMarkdown, replaceExistingMetadata, convertObjArrayToString, alterListOfMarkdownFiles, fileExists, findDelimiterStartPosition } from '../src/markdown'
import Path from 'path'
import { promises as fs, constants as fsconstants } from 'fs'

describe('markdown', () => {

    describe('alterListOfMarkdownFiles', () => {

        const listOfFiles: any = [
            "articles/cognitive-services/LUIS/luis-nodejs-tutorial-bf-v4.md",
            "articles/cognitive-services/LUIS/luis-tutorial-node-import-utterances-csv.md"
        ]

        const listOfFilesFalse: any = [
            "articles/cognitive-services/LUIS/does-not-exist-1.md",
            "articles/cognitive-services/does-not-exist-2.md"
        ]

        const globalOptions = {
            surroundingDelimiter: "---\r\n", delimiter: ",",
            endOfItemDelimiter: "\r\n", overwriteFile: true,
            newFileNamePostPend: ""
        };

        const pathToRootOfRepo: String = "C:\\Users\\diberry\\repos\\docs\\azure-docs-pr"

        // TBD - fill these in
        const listOfStatus: any = []
        const listOfStatusFalse: any = []

        const options = {
            alterations: [
                {
                    type: "append",
                    field: "ms.custom",
                    append: "devx-track-javascript",
                }
            ]
        }

        const trueCases = [
            [pathToRootOfRepo, listOfFiles, options, listOfStatus]
        ]

        const falseCases = [
            [pathToRootOfRepo, listOfFilesFalse, options, listOfStatusFalse]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs: %s',
                async (pathToRootOfRepo, listOfFiles, options, listOfStatus) => {
                    const statusList = await alterListOfMarkdownFiles(pathToRootOfRepo, listOfFiles, globalOptions, options)
                    expect(statusList).not.toBe(undefined)
                })
        })

        describe('false cases', () => {
            test.each(falseCases)(
                'should return false for inputs: %s',
                async (pathToRootOfRepo, listOfFiles, options, listOfStatus) => {
                    const statusList = await alterListOfMarkdownFiles(pathToRootOfRepo, listOfFiles, globalOptions, options)
                    expect(statusList).not.toBe(undefined)
                })
        })
    })
    /*
        describe.only('path', () => {
            it('test1', () =>{
                myPath()
            })
        })
    */
    describe('alterFile', () => {

        const trueCases = [
            [
                "C:\\Users\\diberry\\repos\\dina\\markdown-tools\\data\\test_copy.md", 
                {
                    surroundingDelimiter: "---\r\n", 
                    interValuedelimiter: ",", 
                    propertyDelimiter: ":",
                    endOfItemDelimiter: "\r\n", 
                    overwriteFile: false,
                    newFileNamePostPend: ".new.md"
                },
                [{ type: "append", field: "ms.author", append: "bingo" }],
                [
                    { property: `title`, value: `Use web app - Personalizer` },
                    { property: `description`, value: `Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
                    { property: 'ms.topic', value: `tutorial` },
                    { property: 'ms.date', value: `06/10/2020` },
                    { property: 'ms.author', value: `diberry, bingo` }
                ],
                {status: 'success',
                file:
                 'C:\\Users\\diberry\\repos\\dina\\markdown-tools\\data\\test_copy.md.new.md'}
            ],[

                "C:\\Users\\diberry\\repos\\dina\\markdown-tools\\data\\test_copy2.md",
                {
                    surroundingDelimiter: "---\r\n", 
                    interValuedelimiter: ",", 
                    propertyDelimiter: ":",
                    endOfItemDelimiter: "\r\n", 
                    overwriteFile: true,
                    newFileNamePostPend: ""
                },
                [{ type: "append", field: "ms.topic", append: "helloWorld" }],
                [
                    { property: `title`, value: `Use web app - Personalizer` },
                    { property: `description`, value: `Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
                    { property: 'ms.topic', value: `tutorial, helloWorld` },
                    { property: 'ms.date', value: `06/10/2020` },
                    { property: 'ms.author', value: `diberry` }
                ],
                {status: 'success',
                file:
                 'C:\\Users\\diberry\\repos\\dina\\markdown-tools\\data\\test_copy.md.new.md'}
            ]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs',
                async (fullPath: any, globalOptions: any, modifications: any, result) => {
                    const testCaseResult = await alterFile(fullPath, globalOptions, modifications)
                    console.log(testCaseResult)
                    ///expect(JSON.stringify(testCaseResult)).toEqual(JSON.stringify(result))
                })
        })

    })


    describe('alterMetadata', () => {
       
        const globalOptions = {surroundingDelimiter:"---\n", interValuedelimiter: ",",
        endOfItemDelimiter: "\n",overwriteFile: true,
        newFileNamePostPend: ""}
        
        const case1Data = [
            { property: `title`, value: `1Use web app - Personalizer` },
            { property: `description`, value: `1Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
            { property: 'ms.topic', value: `1tutorial` },
            { property: 'ms.date', value: `106/10/2020` },
            { property: 'ms.author', value: `1diberry` }
        ]

        const case1Options = [{ type: "append", field: "ms.topic", append: "helloWorld"}]

        const case1Results = [
            { property: `title`, value: `1Use web app - Personalizer` },
            { property: `description`, value: `1Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
            { property: 'ms.topic', value: `1tutorial, helloWorld` },
            { property: 'ms.date', value: `106/10/2020` },
            { property: 'ms.author', value: `1diberry` }
        ]

        const case2Data = [
            { property: `title`, value: `2Use web app - Personalizer` },
            { property: `description`, value: `2Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
            { property: 'ms.date', value: `206/10/2020` },
            { property: 'ms.author', value: `2diberry` }
        ]

        const case2Options = [{ type: "append", field: "ms.topic", append: "helloWorld"}]

        const case2Results = [
            { property: `title`, value: `2Use web app - Personalizer` },
            { property: `description`, value: `2Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
            { property: 'ms.date', value: `206/10/2020` },
            { property: 'ms.author', value: `2diberry` },
            { property: 'ms.topic', value: `helloWorld` }
        ]

        const trueCases = [
            [case1Data, globalOptions, case1Options, case1Results],
            [case2Data, globalOptions,case2Options, case2Results]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs',
                async (data: any, globalOptions:any, options: any, result) => {
                    const testCaseResult = await alterMetadata(data, globalOptions, options)
                    expect(JSON.stringify(testCaseResult)).toEqual(JSON.stringify(result))
                })
        })

    })

    describe('getMetadataFromMarkdown', () => {

        const trueCases = [
            [`---
            title: Use web app - Personalizer
            description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
            ms.topic: tutorial
            ms.date: 06/10/2020
            ms.author: diberry
            ---
            # Tutorial: Add Personalizer to a .NET web app

            Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.

            **In this tutorial, you learn how to:**

            <!-- green checkmark -->
            > [!div class="checklist"]
            > * Set up Personalizer key and endpoint
            > * Collect features
            > * Call Rank and Reward APIs
            > * Display top action, designated as _rewardActionId_

            `, `title: Use web app - Personalizer
            description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
            ms.topic: tutorial
            ms.date: 06/10/2020
            ms.author: diberry`]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs',
                async (param1, result) => {
                    const testCaseResult = getMetadataFromMarkdown(param1)
                    expect(testCaseResult).toEqual(result)
                })
        })

    })

    describe('replaceExistingMetadata ', () => {

        const oldContent1 = `---
title: Use web app - Personalizer
description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
ms.topic: tutorial
ms.custom: hello
ms.date: 06/10/2020
ms.author: diberry
---
# Tutorial: Add Personalizer to a .NET web app

Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.

**In this tutorial, you learn how to:**

<!-- green checkmark -->
> [!div class="checklist"]
> * Set up Personalizer key and endpoint
> * Collect features
> * Call Rank and Reward APIs
> * Display top action, designated as _rewardActionId_`

        const alteredMetadata1 = `title: Use web app - Personalizer
description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
ms.topic: tutorial, helloWorld
ms.custom: hello
ms.date: 06/10/2020
ms.author: diberry
`

        const newContent1 = `---
title: Use web app - Personalizer
description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
ms.topic: tutorial, helloWorld
ms.custom: hello
ms.date: 06/10/2020
ms.author: diberry
---
# Tutorial: Add Personalizer to a .NET web app

Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.

**In this tutorial, you learn how to:**

<!-- green checkmark -->
> [!div class="checklist"]
> * Set up Personalizer key and endpoint
> * Collect features
> * Call Rank and Reward APIs
> * Display top action, designated as _rewardActionId_`

        const surroundingDelimiter1 = "---\n"

        const oldContent2 = `-\nms.topic: tutorial\nms.custom: hello\n-\n# Tutorial: Add Personalizer to a .NET web app\n\n> * Set up Personalizer key and endpoint`

        const alteredMetadata2 = `ms.topic: AAAtutorialXXX\nms.custom: BBBhelloXXX\n`

        const newContent2 = `-\nms.topic: AAAtutorialXXX\nms.custom: BBBhelloXXX\n-\n# Tutorial: Add Personalizer to a .NET web app\n\n> * Set up Personalizer key and endpoint`

        const surroundingDelimiter2 = "-\n"


        const trueCases = [
            //[oldContent1, alteredMetadata1, surroundingDelimiter1, newContent1],
            [oldContent2, alteredMetadata2, surroundingDelimiter2, newContent2],
        ]

        test.each(trueCases)(
            'should return true for inputs: %s',
            async (oldContent, alteredMetadata, surroundingDelimiter, newContent) => {

                const returnedNewContent = replaceExistingMetadata(oldContent, alteredMetadata, surroundingDelimiter)
                expect(returnedNewContent.trim()).toEqual(newContent.trim())
            })

    })

    describe('regEx', () => {
        it('metadata extraction', (done) => {
            try {

                const content = `---
            title: Use web app - Personalizer
            description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
            ms.topic: tutorial
            ms.custom: hello
            ms.date: 06/10/2020
            ms.author: diberry
            ---
            # Tutorial: Add Personalizer to a .NET web app

            Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.

            **In this tutorial, you learn how to:**

            <!-- green checkmark -->
            > [!div class="checklist"]
            > * Set up Personalizer key and endpoint
            > * Collect features
            > * Call Rank and Reward APIs
            > * Display top action, designated as _rewardActionId_
            `

                const metadataRegex = new RegExp('---(.+?)---(.+?)', 'gism')


                const results = regEx(metadataRegex, content)

                done()
            } catch (err) {
                done(err)
            }
        })
    })
    describe('hasMetadataField', () => {

        const trueCases = [
            ["ms.topic"],
            ["title"],
            ["ms.author"]
        ]

        const falseCases = [
            ["ms.doesnotexist"]
        ]

        const content = `---
        title: Use web app - Personalizer
        description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
        ms.topic: tutorial
        ms.custom: hello
        ms.date: 06/10/2020
        ms.author: diberry
        ---`

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs: %s',
                (field) => {
                    const testCaseResult = hasMetadataField(field, content)
                    expect(testCaseResult).toBe(true)
                })
        })

        describe('false cases', () => {
            test.each(falseCases)(
                'should return false for inputs: %s',
                (field) => {
                    const testCaseResult = hasMetadataField(field, content)
                    expect(testCaseResult).toBe(false)
                })
        })
    })

    describe('fileExists', () => {

        describe('true cases', () => {

            const trueCases = [
                ["C:\\Users\\diberry\\repos\\docs\\azure-docs-pr\\articles\\cognitive-services\\LUIS\\luis-nodejs-tutorial-bf-v4.md", true],
                ["C:\\Users\\diberry\\repos\\docs\\azure-docs-pr\\articles\\cognitive-services\\LUIS\\luis-tutorial-node-import-utterances-csv.md", true]
            ]

            const falseCases = [
                ["C:\\Users\\diberry\\repos\\docs\\azure-docs-pr\\articles\\cognitive-services\\LUIS\\does-not-exist.md", false],
                ["D:\\Users\\diberry\\repos\\docs\\azure-docs-pr\\articles\\cognitive-services\\LUIS\\luis-tutorial-node-import-utterances-csv.md", false]
            ]

            const options: number = fsconstants.O_RDWR

            test.each(trueCases)(
                'should return true for inputs: %s',
                async (filename, result) => {

                    //@ts-ignore
                    const testCaseResult = await fileExists(filename, options)
                    expect(testCaseResult).toBe(result)
                })

            test.each(falseCases)(
                'should return false for inputs: %s',
                async (filename, result) => {

                    //@ts-ignore
                    const testCaseResult = await fileExists(filename, options)
                    expect(testCaseResult).toBe(result)
                })
        })
    })


    describe('isArray', () => {

        const trueCases = [
            [["a", "b", "c"]]
        ]

        const falseCases = [
            ["title"],
            ["val1, val2, val3"]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs: %s',
                (fieldValue) => {
                    const testCaseResult = isArray(fieldValue)
                    expect(testCaseResult).toBe(true)
                })
        })

        describe('false cases', () => {
            test.each(falseCases)(
                'should return false for inputs: %s',
                (fieldValue) => {
                    const testCaseResult = isArray(fieldValue)
                    expect(testCaseResult).toBe(false)
                })
        })
    })

    // marker is at end of delimiter
    describe('findDelimiterStartPositions', () => {

        const trueCase1 = [
            "---\nthis is a test\nanother test\nand again\n---\n# Tutorial: Add Personalizer to a .NET web app\n\nCustomize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.",
            "---\n",
            [4, 46]
        ]

        const trueCase2 = [
            "abc123---alpha:1\nbeta:2\b---xyz789",
            "---",
            [9, 27]
        ]

        const trueCases = [
            trueCase1,
            trueCase2
        ]


        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs: %s',
                (sourceString: any, delimiter: any, resultingArray: any) => {
                    const testCaseResult = findDelimiterStartPosition(sourceString, delimiter)
                    expect(testCaseResult).toStrictEqual(resultingArray)
                })
        })

    })

    describe('convertObjArrayToString', () => {

        const case1Data = [
            { property: `title`, value: `1Use web app - Personalizer` },
            { property: `description`, value: `1Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
            { property: 'ms.topic', value: `1tutorial` },
            { property: 'ms.date', value: `106/10/2020` },
            { property: 'ms.author', value: `1diberry` }
        ]

        const case1Result = "title: 1Use web app - Personalizer\ndescription: 1Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.\nms.topic: 1tutorial\nms.date: 106/10/2020\nms.author: 1diberry\n"

        const trueCases = [
            [case1Data, case1Result]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs: %s',
                (fieldValue, returns) => {
                    const testCaseResult = convertObjArrayToString(fieldValue, ":", "\n")
                    expect(testCaseResult).toBe(returns)
                })
        })
    })

    describe('stringToList', () => {

        const trueCases = [
            [`title: Use web app - Personalizer
            description: Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.
            ms.topic: tutorial
            ms.custom: hello
            ms.date: 06/10/2020
            ms.author: diberry`,
                [
                    { property: `title`, value: `Use web app - Personalizer` },
                    { property: `description`, value: `Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` },
                    { property: 'ms.topic', value: `tutorial` },
                    { property: 'ms.custom', value: `hello` },
                    { property: 'ms.date', value: `06/10/2020` },
                    { property: 'ms.author', value: `diberry` }
                ]
            ]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs: %s',
                (fieldsAsString, result) => {
                    const testCaseResult = stringToList(fieldsAsString)
                    expect(testCaseResult).toEqual(result)
                })
        })

    })

    describe('stringToNameValuePair', () => {

        const trueCases = [
            ["   description:    Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.    ",
                { property: 'description', value: `Customize a C# .NET web app with a Personalizer loop to provide the correct content to a user based on actions (with features) and context features.` }]
        ]

        describe('true cases', () => {
            test.each(trueCases)(
                'should return true for inputs',
                (param1, result) => {
                    //@ts-ignore
                    const testCaseResult = stringToNameValuePair(param1)
                    expect(testCaseResult).toEqual(result)
                })
        })

    })
})