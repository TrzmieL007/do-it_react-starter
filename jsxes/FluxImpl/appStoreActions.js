/**
 * Created by trzmiel007 on 16/11/16.
 */

export const CHANGE_CLIENT_CODE = "CHANGE_CLIENT_CODE";

export function changeClientCode(clientCode){
    return { type : CHANGE_CLIENT_CODE, clientCode };
}
