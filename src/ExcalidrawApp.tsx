import React, {
	useState,
	useRef,
	useCallback,
	Children,
	cloneElement,
	useEffect,
} from "react";

import { Button } from "@/components/ui/button";
import type * as TExcalidraw from "@excalidraw/excalidraw";
import type {
	NonDeletedExcalidrawElement,
	Theme,
} from "@excalidraw/excalidraw/element/types";
import type {
	AppState,
	ExcalidrawImperativeAPI,
	Gesture,
	PointerDownState as ExcalidrawPointerDownState,
} from "@excalidraw/excalidraw/types";

import {
	distance2d,
	withBatchedUpdates,
	withBatchedUpdatesThrottled,
} from "../utils";

import "./ExcalidrawApp.scss";
import DrawingsList from "./components/drawings-list";
import { useQuery } from "@tanstack/react-query";
import { fetchLoadData } from "./lib/api";

type Comment = {
	x: number;
	y: number;
	value: string;
	id?: string;
};

export interface AppProps {
	initialData: null | any;
	customArgs?: any[];
	children: React.ReactNode;
	excalidrawLib: typeof TExcalidraw;
}

function loadNewScene(item: any) {
	alert("loaded new scene");
  console.log(item);
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
	const [viewModeEnabled, setViewModeEnabled] = useState(false);
	const [zenModeEnabled, setZenModeEnabled] = useState(false);
	const [gridModeEnabled, setGridModeEnabled] = useState(false);
	const [renderScrollbars, setRenderScrollbars] = useState(false);
	const [theme, setTheme] = useState<Theme | "system">("light");
	const [disableImageTool, setDisableImageTool] = useState(false);
	const [isCollaborating, setIsCollaborating] = useState(false);
	const [showSaved, setShowSaved] = useState(false);
	const [commentIcons, setCommentIcons] = useState<{ [id: string]: Comment }>(
		{},
	);
	const [comment, setComment] = useState<Comment | null>(null);

	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);

  const { data: drawingsItems, isPending, isError } = useQuery({
    queryKey: ['loadDrawings'],
    queryFn: fetchLoadData,
  }) 

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
				viewModeEnabled,
				zenModeEnabled,
				renderScrollbars,
				gridModeEnabled,
				theme,
				name: "Custom name of drawing",
				UIOptions: {
					canvasActions: {
						loadScene: true,
					},
					tools: { image: !disableImageTool },
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
				{showSaved && (
					<DrawingsList
						items={drawingsItems}
						onSelect={(item: any) => (loadNewScene(item))}
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

	interface Drawing {
		id: number;
		created: string;
		modified: string;
		data: object;
	}

	const renderTopRightUI = (isMobile: boolean) => {
		return (
			<>
				{!isMobile && (
					<LiveCollaborationTrigger
						isCollaborating={isCollaborating}
						onSelect={() => {
							window.alert("Collab dialog clicked");
						}}
					/>
				)}
				<button
					onClick={() => {
						setShowSaved(!showSaved);
            console.log("showSaved", showSaved);
					}}
					style={{ height: "2.5rem" }}
				>
					show drawings
				</button>
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
					isCollaborating={isCollaborating}
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
