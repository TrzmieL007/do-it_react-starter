/**
 * Created by trzmiel007 on 16/11/16.
 */

export const CHANGE_CLIENT_CODE = "CHANGE_CLIENT_CODE";
export const CHANGE_THEME = "CHANGE_THEME";

export function changeClientCode(clientCode){
    return { type : CHANGE_CLIENT_CODE, clientCode };
}
export function changeTheme(theme){
    return { type : CHANGE_THEME, theme };
}