/**
 * Created by trzmiel007 on 04/11/16.
 */
export const CHANGE_CLIENT = 'CHANGE_CLIENT';

export function changeClientCode(clientCode){
    return { type : CHANGE_CLIENT, clientCode };
}