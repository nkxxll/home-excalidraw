import React, {
	useState,
	useRef,
	useCallback,
	Children,
	cloneElement,
} from "react";

import { Button } from "@/components/ui/button";
import type {
	ExcalidrawElement,
	NonDeletedExcalidrawElement,
	Theme,
} from "@excalidraw/excalidraw/element/types";
import type {
	AppState,
	ExcalidrawImperativeAPI,
	Gesture,
	PointerDownState as ExcalidrawPointerDownState,
	BinaryFiles,
} from "@excalidraw/excalidraw/types";

import {
	distance2d,
	withBatchedUpdates,
	withBatchedUpdatesThrottled,
} from "../utils";

import "./ExcalidrawApp.scss";
import DrawingsList from "./components/drawings-list";
import {
	useQuery,
	useMutation,
	type UseMutationResult,
	useQueryClient,
} from "@tanstack/react-query";
import {
	fetchDeleteData,
	fetchLoadData,
	fetchSaveData,
	fetchUpdateData,
	type SaveDataProps,
	type UpdateDataProps,
} from "./lib/api";
import {
	loadFromBlob,
	MIME_TYPES,
	serializeAsJSON,
} from "@excalidraw/excalidraw";
import type { AppProps, Comment, Drawing } from "@/lib/types";
import { EnterTitle } from "./components/enter-title";

async function saveNewDrawing(
	mutation: UseMutationResult<void, Error, SaveDataProps, unknown>,
	title: string,
	elements: readonly ExcalidrawElement[],
	appState: Partial<AppState>,
	files: BinaryFiles,
) {
	const localJson = serializeAsJSON(elements, appState, files, "local");
	console.log("localJson", localJson);
	mutation.mutate({ title: title, data: localJson });
}

function updateDrawing(
	mutation: UseMutationResult<void, Error, UpdateDataProps, unknown>,
	item: Drawing,
	elements: readonly ExcalidrawElement[],
	appState: Partial<AppState>,
	files: BinaryFiles,
	newTitle: string | null = null,
) {
	const title = newTitle ? newTitle : item.title;
	const data = serializeAsJSON(elements, appState, files, "local");
	const newItem = {
		id: item.id,
		title,
		data,
		created: item.created,
		modified: new Date().toISOString(),
	};
	mutation.mutate({ item: newItem });
}

export default function ExampleApp({
	initialData,
	children,
	excalidrawLib,
}: AppProps) {
	const {
		exportToClipboard,
		useHandleLibrary,
		sceneCoordsToViewportCoords,
		viewportCoordsToSceneCoords,
		WelcomeScreen,
		MainMenu,
		LiveCollaborationTrigger,
		TTDDialog,
		TTDDialogTrigger,
	} = excalidrawLib;
	const appRef = useRef<any>(null);
	const [theme, setTheme] = useState<Theme | "system">("light");
	const [showSaved, setShowSaved] = useState(false);
	const [showEnterTitle, setShowEnterTitle] = useState(false);
	const [currentSceneID, setCurrentSceneID] = useState<number | null>(null);
	const [commentIcons, setCommentIcons] = useState<{ [id: string]: Comment }>(
		{},
	);
	const [currentTitle, setCurrentTitle] = useState("");
	const [comment, setComment] = useState<Comment | null>(null);

	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);

	const queryClient = useQueryClient();
	const {
		data: drawingsItems,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["loadDrawings"],
		queryFn: fetchLoadData,
	});

	const saveMutation = useMutation({
		mutationKey: ["saveDrawing"],
		mutationFn: fetchSaveData,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["loadDrawings"] }); // refresh list
			setCurrentSceneID(parseInt(data, 10));
		},
	});

	function handleTitleSubmit(title: string) {
		if (!excalidrawAPI) {
			console.error("api is null");
			return;
		}
		saveNewDrawing(
			saveMutation,
			title,
			excalidrawAPI.getSceneElements(),
			excalidrawAPI.getAppState(),
			excalidrawAPI.getFiles(),
		);
	}

	const updateMutation = useMutation({
		mutationKey: ["updateDrawing"],
		mutationFn: fetchUpdateData,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["loadDrawings"] }); // refresh list
		},
	});

	const deleteMutation = useMutation({
		mutationKey: ["deleteDrawing"],
		mutationFn: fetchDeleteData,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["loadDrawings"] }); // refresh list
		},
	});

	async function loadNewScene(id: number, data: string) {
		if (!excalidrawAPI) {
			console.error("api is null");
			return;
		}
    setShowSaved(false);
		if (currentSceneID) {
			const item = drawingsItems.find(
				(item: Drawing) => item.id === currentSceneID,
			);
			if (item) {
				updateDrawing(
					updateMutation,
					item,
					excalidrawAPI.getSceneElements(),
					excalidrawAPI.getAppState(),
					excalidrawAPI.getFiles(),
				);
			}
		}
		// update to new scene id
		setCurrentSceneID(id);

		const blob = new Blob([data], {
			type: MIME_TYPES.excalidraw,
		});

		const scene = await loadFromBlob(blob, null, null);

		excalidrawAPI.updateScene(scene);
		console.log("updated scene");
	}

	useHandleLibrary({ excalidrawAPI });

	const renderExcalidraw = (children: React.ReactNode) => {
		const Excalidraw: any = Children.toArray(children).find(
			(child) =>
				React.isValidElement(child) &&
				typeof child.type !== "string" &&
				//@ts-ignore
				child.type.displayName === "Excalidraw",
		);
		if (!Excalidraw) {
			return;
		}
		const newElement = cloneElement(
			Excalidraw,
			{
				excalidrawAPI: (api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api),
				initialData: initialData,
				theme,
				name: "Custom name of drawing",
				UIOptions: {
					canvasActions: {
						loadScene: true,
					},
					tools: { image: true },
				},
				renderTopRightUI,
				onLinkOpen,
				onPointerDown,
				onScrollChange: rerenderCommentIcons,
				validateEmbeddable: true,
			},
			<>
				<WelcomeScreen />
				{renderMenu()}
				{excalidrawAPI && (
					<TTDDialogTrigger icon={<span>😀</span>}>
						Text to diagram
					</TTDDialogTrigger>
				)}
				{showEnterTitle && (
					<EnterTitle
						open={showEnterTitle}
						setOpen={setShowEnterTitle}
						onSubmit={handleTitleSubmit}
						triggerLabel={"Enter a Title"}
					/>
				)}
				{showSaved && (
					<DrawingsList
						items={drawingsItems}
						onSubmit={(id: number, item: string) => {
							return loadNewScene(id, item);
						}}
						onDelete={(id: number) => {
							if (id === currentSceneID) {
								setCurrentSceneID(null);
							}
							return deleteMutation.mutate({ id });
						}}
						onClose={() => setShowSaved(!showSaved)}
					/>
				)}
				<TTDDialog
					onTextSubmit={async (_) => {
						console.info("submit");
						// sleep for 2s
						await new Promise((resolve) => setTimeout(resolve, 2000));
						throw new Error("error, go away now");
						// return "dummy";
					}}
				/>
			</>,
		);
		return newElement;
	};

	const renderTopRightUI = (isMobile: boolean) => {
		return (
			<>
				{!isMobile && (
					<LiveCollaborationTrigger
						isCollaborating={false}
						onSelect={() => {
							window.alert("Collab dialog clicked");
						}}
					/>
				)}
				<span>{currentSceneID}</span>
				<Button
					onClick={() => {
						setShowSaved(!showSaved);
					}}
					style={{ height: "2.5rem" }}
				>
					Show Drawings
				</Button>
				<Button
					type="button"
					onClick={() => {
						if (!excalidrawAPI) {
							return;
						}
						setShowEnterTitle(true);
					}}
					style={{ height: "2.5rem" }}
				>
					New Scene
				</Button>
			</>
		);
	};

	const onLinkOpen = useCallback(
		(
			element: NonDeletedExcalidrawElement,
			event: CustomEvent<{
				nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
			}>,
		) => {
			const link = element.link!;
			const { nativeEvent } = event.detail;
			const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
			const isNewWindow = nativeEvent.shiftKey;
			const isInternalLink =
				link.startsWith("/") || link.includes(window.location.origin);
			if (isInternalLink && !isNewTab && !isNewWindow) {
				// signal that we're handling the redirect ourselves
				event.preventDefault();
				// do a custom redirect, such as passing to react-router
				// ...
			}
		},
		[],
	);

	const onCopy = async (type: "png" | "svg" | "json") => {
		if (!excalidrawAPI) {
			return false;
		}
		await exportToClipboard({
			elements: excalidrawAPI.getSceneElements(),
			appState: excalidrawAPI.getAppState(),
			files: excalidrawAPI.getFiles(),
			type,
		});
		window.alert(`Copied to clipboard as ${type} successfully`);
	};

	const [pointerData, setPointerData] = useState<{
		pointer: { x: number; y: number };
		button: "down" | "up";
		pointersMap: Gesture["pointers"];
	} | null>(null);

	const onPointerDown = (
		activeTool: AppState["activeTool"],
		pointerDownState: ExcalidrawPointerDownState,
	) => {
		if (activeTool.type === "custom" && activeTool.customType === "comment") {
			const { x, y } = pointerDownState.origin;
			setComment({ x, y, value: "" });
		}
	};

	const rerenderCommentIcons = () => {
		if (!excalidrawAPI) {
			return false;
		}
		const commentIconsElements = appRef.current.querySelectorAll(
			".comment-icon",
		) as HTMLElement[];
		commentIconsElements.forEach((ele) => {
			const id = ele.id;
			const appstate = excalidrawAPI.getAppState();
			const { x, y } = sceneCoordsToViewportCoords(
				{ sceneX: commentIcons[id].x, sceneY: commentIcons[id].y },
				appstate,
			);
			ele.style.left = `${
				x - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetLeft
			}px`;
			ele.style.top = `${
				y - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetTop
			}px`;
		});
	};

	const onPointerMoveFromPointerDownHandler = (
		pointerDownState: PointerDownState,
	) => {
		return withBatchedUpdatesThrottled((event) => {
			if (!excalidrawAPI) {
				return false;
			}
			const { x, y } = viewportCoordsToSceneCoords(
				{
					clientX: event.clientX - pointerDownState.hitElementOffsets.x,
					clientY: event.clientY - pointerDownState.hitElementOffsets.y,
				},
				excalidrawAPI.getAppState(),
			);
			setCommentIcons({
				...commentIcons,
				[pointerDownState.hitElement.id!]: {
					...commentIcons[pointerDownState.hitElement.id!],
					x,
					y,
				},
			});
		});
	};
	const onPointerUpFromPointerDownHandler = (
		pointerDownState: PointerDownState,
	) => {
		return withBatchedUpdates((event) => {
			window.removeEventListener("pointermove", pointerDownState.onMove);
			window.removeEventListener("pointerup", pointerDownState.onUp);
			excalidrawAPI?.setActiveTool({ type: "selection" });
			const distance = distance2d(
				pointerDownState.x,
				pointerDownState.y,
				event.clientX,
				event.clientY,
			);
			if (distance === 0) {
				if (!comment) {
					setComment({
						x: pointerDownState.hitElement.x + 60,
						y: pointerDownState.hitElement.y,
						value: pointerDownState.hitElement.value,
						id: pointerDownState.hitElement.id,
					});
				} else {
					setComment(null);
				}
			}
		});
	};

	const renderCommentIcons = () => {
		return Object.values(commentIcons).map((commentIcon) => {
			if (!excalidrawAPI) {
				return false;
			}
			const appState = excalidrawAPI.getAppState();
			const { x, y } = sceneCoordsToViewportCoords(
				{ sceneX: commentIcon.x, sceneY: commentIcon.y },
				excalidrawAPI.getAppState(),
			);
			return (
				<div
					id={commentIcon.id}
					key={commentIcon.id}
					style={{
						top: `${y - COMMENT_ICON_DIMENSION / 2 - appState!.offsetTop}px`,
						left: `${x - COMMENT_ICON_DIMENSION / 2 - appState!.offsetLeft}px`,
						position: "absolute",
						zIndex: 1,
						width: `${COMMENT_ICON_DIMENSION}px`,
						height: `${COMMENT_ICON_DIMENSION}px`,
						cursor: "pointer",
						touchAction: "none",
					}}
					className="comment-icon"
					onPointerDown={(event) => {
						event.preventDefault();
						if (comment) {
							commentIcon.value = comment.value;
							saveComment();
						}
						const pointerDownState: any = {
							x: event.clientX,
							y: event.clientY,
							hitElement: commentIcon,
							hitElementOffsets: { x: event.clientX - x, y: event.clientY - y },
						};
						const onPointerMove =
							onPointerMoveFromPointerDownHandler(pointerDownState);
						const onPointerUp =
							onPointerUpFromPointerDownHandler(pointerDownState);
						window.addEventListener("pointermove", onPointerMove);
						window.addEventListener("pointerup", onPointerUp);

						pointerDownState.onMove = onPointerMove;
						pointerDownState.onUp = onPointerUp;

						excalidrawAPI?.setActiveTool({
							type: "custom",
							customType: "comment",
						});
					}}
				>
					<div className="comment-avatar">
						<img src="images/doremon.png" alt="doremon" />
					</div>
				</div>
			);
		});
	};

	const renderMenu = () => {
		return (
			<MainMenu>
				<MainMenu.DefaultItems.ToggleTheme
					allowSystemTheme
					theme={theme}
					onSelect={(t: Theme | "system") => setTheme(t)}
				/>
				<MainMenu.DefaultItems.SaveAsImage />
				<MainMenu.DefaultItems.SaveToActiveFile />
				<MainMenu.DefaultItems.Export />
				<MainMenu.DefaultItems.ClearCanvas />
				<MainMenu.DefaultItems.SearchMenu />
				<MainMenu.Separator />
				<MainMenu.DefaultItems.LiveCollaborationTrigger
					isCollaborating={false}
					onSelect={() => window.alert("You clicked on collab button")}
				/>
				<MainMenu.Separator />
				<MainMenu.DefaultItems.LoadScene />
				<MainMenu.ItemCustom>
					<Button
						style={{ height: "2rem" }}
						onClick={() => window.alert("custom menu item")}
					>
						custom item
					</Button>
				</MainMenu.ItemCustom>
				<MainMenu.DefaultItems.ChangeCanvasBackground />
				<MainMenu.DefaultItems.Help />
			</MainMenu>
		);
	};

	return (
		<div className="App" ref={appRef}>
			<div className="excalidraw-wrapper">
				{renderExcalidraw(children)}
				{Object.keys(commentIcons || []).length > 0 && renderCommentIcons()}
			</div>
		</div>
	);
}
