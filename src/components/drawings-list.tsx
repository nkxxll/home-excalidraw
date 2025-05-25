interface DrawingsListParms {
	items: any[];
	onClose: () => void;
	onSubmit: (item: string) => Promise<void>;
}

interface DrawingsItem {
	id: number;
	created: string;
	modified: string;
	data: string; // json string
}

export default function DrawingsList({
	items,
	onClose,
	onSubmit,
}: DrawingsListParms) {
	const testItem: DrawingsItem = {
		id: 200,
		created: new Date().toISOString(),
		modified: new Date().toISOString(),
		data: `{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "EUTP6IrfXCHMsYfd-ac7t",
      "type": "rectangle",
      "x": 489.3984375,
      "y": 169.734375,
      "width": 338.06640625,
      "height": 189.453125,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a0",
      "roundness": {
        "type": 3
      },
      "seed": 521935959,
      "version": 247,
      "versionNonce": 1184855127,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1747750143807,
      "link": null,
      "locked": false
    },
    {
      "id": "MhCymKS7pQtIlO2_G-2c0",
      "type": "text",
      "x": 512.54296875,
      "y": 192.421875,
      "width": 122.59988403320312,
      "height": 25,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a2",
      "roundness": null,
      "seed": 1653368185,
      "version": 15,
      "versionNonce": 1165831609,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1747750151177,
      "link": null,
      "locked": false,
      "text": "url gathering",
      "fontSize": 20,
      "fontFamily": 5,
      "textAlign": "left",
      "verticalAlign": "top",
      "containerId": null,
      "originalText": "url gathering",
      "autoResize": true,
      "lineHeight": 1.25
    }
  ],
  "appState": {
    "gridSize": 20,
    "gridStep": 5,
    "gridModeEnabled": false,
    "viewBackgroundColor": "#ffffff",
    "lockedMultiSelections": {}
  },
  "files": {}
}
`,
	};
	return (
		<div className="fixed top-0 right-0 left-0 w-1/2 z-10">
			<ul>
				{items.map((item) => {
					return (
						<li
							key={`${item.id}`}
						>{`${item.id} ${item.created} ${item.modified} ${item.data}`}</li>
					);
				})}
				<li key={`${testItem.id}`}>
					{`${testItem.id} ${testItem.created} ${testItem.modified} ${testItem.data.slice(0, 10)}`}
					<button type="button" onClick={() => onSubmit(testItem.data)}>load</button>
				</li>
				<button type="button" onClick={onClose}>close</button>
			</ul>
		</div>
	);
}
