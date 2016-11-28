/**
 * Created by trzmiel007 on 20/11/16.
 */

import uuid from 'uuid';

export const OPEN_WINDOW = "OPEN_WINDOW";
export const CLOSE_WINDOW = "CLOSE_WINDOW";
export const CLOSE_ALL_WINDOWS = "CLOSE_ALL_WINDOWS";
export const UPDATE_WINDOW = "UPDATE_WINDOW";

/**
 * Makes UI to create a window. Id <code>id</code> null, undefined, false, 0 or anything that is evaluated to false,<br/>
 * the id will be assigned automatically by <code>uuid.v4()</code>, and you will be able to get it out by grabbing<br/>
 * <code>id</code> property out of object returned by <code>props.actions.openWindow</code> function (this function).
 * @param id
 * @param title
 * @param content
 * @returns {{type: string, id: *, title: *, content: *}}
 */
export function openWindow(id, title, content){
    return { type : OPEN_WINDOW, id: id || uuid.v4(), title, content };
}
/**
 * Closes the window with matched <code>id</code>.
 * @param id
 * @returns {{type: string, id: *}}
 */
export function closeWindow(id){
    return { type : CLOSE_WINDOW, id };
}
/**
 * Closes all currently open windows.
 * @returns {{type: string}}
 */
export function closeAllWindows(){
    return { type : CLOSE_ALL_WINDOWS };
}
/**
 * Updates window that matches <code>id</code>.
 * @param id
 * @param title
 * @param content
 * @returns {{type: string, id: *, title: *, content: *}}
 */
export function updateWindow(id, title, content){
    return { type : UPDATE_WINDOW, id, title, content };
}