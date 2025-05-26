# todo

## Notes API

[api docu](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils)

- useful functions and link
- `serializeAsJSON` to save a scene as json
- see [this](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/data/json.ts#L42) for more information on the function
- `serializeLibraryAsJSON` to save a lib don't know if I need that for now
- `loadFromBlob` load a scene from a (excalidraw json) file
- `loadLibraryFromBlob` load a lib from file
- `loadSceneOrLibraryFromBlob` load scene or lib from blob
- all load throw if the file format does not fit
- `getSceneVersion` can be important but I thing the scene version should be saved
  automatically

## Add mobile footer and other footer back to the example

- for simplicity I have removed all the device specific components form the ex app code because I
  want to understand it add the code back when the time is right

## Change theme does not show up in the main menu

- the change theme toggle thing does not show up in the main menu I will give this another 15min
  then this is a thing for later

## we need to have a current scene

- I have to have a current scene id
- this way I can update the current scene on save and I can make a new scene if we want to and
  find a new id for that scene then
- `useState<any | null>(currentScene, ..)` and then we can just change that if needed
- I also need to add a scene title

## i shouldn't be able to save empty

- it makes not sense to be able to save empty elements
- there should be an error message for that

## viewport width and height

- the viewport width does not fit to the view port lol
- fix it
