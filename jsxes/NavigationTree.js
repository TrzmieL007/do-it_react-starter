/**
 * Created by trzmiel007 on 22/11/16.
 */

import Index from './Views/Home/index';
import CA from './Utils/commonActions';

var navigation = {
    '/': {
        menu: [
            {path: '/Home', title: "Home", icon: "icon-home"},
            {path: '/Report/List', title: "Reports", icon: "icon-book"},
            {path: '/Manage', title: "Manage", icon: "icon-dashboard"},
            {path: '/helpdesk', title: "Help Desk", icon: "icon-question-sign"},
            {path: '/Account/Profile', alt: "My Acount", icon: "icon-user", side: true},
            {alt: "Logout", icon: "icon-signout", callback: CA.signout, side: true}
        ],
        Manage: {
            menu: [
                {path: '/Manage', title: "Dashboard", icon: "icon-dashboard", props: {onlyActiveOnIndex:true}},
                {path: '/Manage/Reports', title: "Reports", icon: "icon-file-text"},
                {path: '/Manage/Standalone', title: "Standalone", icon: "icon-download-alt"},
                {path: '/Manage/Apps', title: "Apps", icon: "icon-download-alt"},
                {path: '/Manage/AdvancedTools', title: "Advanced Tools", icon: "fa fa-wrench"},
                {path: '/Manage/Maintenance', title: "Maintenance", icon: "fa fa-wrench"},
                {path: '/helpdesk', title: "Help Desk", icon: "icon-question-sign"},
                {dropdown: "menuUser", side: true, props: { icon: 'icon-user icon-xxlarge' }, elems:
                    [{path: '/Account/Profile', title: "Profile"}, {path: '/Account/Logoff', title: "Log out", callback: CA.signout}]
                },
                {path: '/Manage/Settings', alt: 'Settings (SU)', icon: "icon-cog", side: true},
                {alt: 'Feedback', icon: "icon-bullhorn", callback: CA.feedbackModal, side: true},
                {path: '/', alt: "Back to Profiler", icon: "icon-signout", side: true}
            ]
        },
        helpdesk: {
            menu: [
                {path: '/helpdesk', title: "Home", icon: "icon-home", props: {onlyActiveOnIndex: true}},
                {path: '/helpdesk/FAQ', title: "Common", icon: "icon-question"},
                {dropdown: "menuUser", props: { icon: "icon-user", text: "My Help Desk" }, elems:
                    [{path: '/helpdesk/Favourite/List', title: "My Favourities"}]
                },
                {path: '/Account/Profile', alt: "My Account", icon: "icon-user", side: true},
                {path: '/', alt: "Back to Profiler", icon: "icon-signout", side: true}
            ]
        }
    }
};
function getMenu(route,menu){
    let root = navigation['/'];
    let path = route.split('/').splice(1);
    let out = root;
    path.forEach(r => {
        if(out.hasOwnProperty(r))
            out = out[r];
    });
    switch(menu){
        case 'side': return out.menu.filter(c=>c.side);
        case 'main': return out.menu.filter(c=>!c.side);
        default: return out;
    }
}

export default {
    routes : {
        childRoutes: [
            {
                path: '/',
                component: Index,
                indexRoute: {onEnter: (nextState, replace) => replace('/Home')},
                childRoutes: [
                    {
                        path: '/Home',
                        component: require('./Views/Home/module'),
                        indexRoute: {onEnter: (nextState, replace) => replace('/Home/overview')},
                        childRoutes: [
                            {
                                path: '/Home/:id',
                                components: {
                                    sideMenu: require('./Views/Home/sideMenu'),
                                    content: require('./Views/Home/moduleContent')
                                }
                            }
                        ]
                    }
                ]
            },
            {
                path: '/helpdesk',
                getComponent(nextState, cb) {
                    require.ensure([], (require) => {
                        cb(null, require('./Views/Helpdesk/index'))
                    }, 'helpdesk')
                },
                getChildRoutes(pns, cb){
                    require.ensure([], function (require) {
                        let routes = [
                            {path: 'FAQ', component: require('./Views/Helpdesk/faq')},
                            {path: 'Favourite/List', component: require('./Views/Helpdesk/favList')},
                        ];
                        cb(null, routes);
                    }, 'helpdesk');
                }
            },
            {
                path: '/Manage',
                getComponent(nextState, cb) {
                    require.ensure([], (require) => {
                        cb(null, require('./Views/Manage/dashboard'))
                    }, 'manage')
                },
                getChildRoutes(pns, cb){
                    require.ensure([], function (require) {
                        let routes = [
                            {path: 'Reports', component: require('./Views/Manage/reports')},
                            {path: 'Standalone', component: require('./Views/Manage/standalone')},
                            {path: 'Apps', component: require('./Views/Manage/apps')},
                            {path: 'AdvancedTools', component: require('./Views/Manage/advancedTools')},
                            {path: 'Maintenance', component: require('./Views/Manage/maintenance')},
                            {path: 'Settings', component: require('./Views/Manage/settings')}
                        ];
                        cb(null, routes);
                    }, 'manage');
                }
            },
            {
                path: '/Report',
                indexRoute: {onEnter: (nextState, replace) => replace('/List')},
                getComponent(nextState, cb) {
                    require.ensure([], (require) => {
                        cb(null, require('./Views/Report/index'))
                    }, 'report')
                },
                getChildRoutes(pns, cb){
                    require.ensure([], function (require) {
                        let routes = [
                            {path: 'List', component: require('./Views/Report/list')},
                            {path: 'Summary', component: require('./Views/Report/summary')}
                        ];
                        cb(null, routes);
                    }, 'report');
                }
            },
            {
                path: '/assessment/:assessmentId',
                getComponent(nextState, cb) {
                    require.ensure([], (require) => {
                        cb(null, require('./Views/Home/Assessments/assessment'))
                    }, 'assessment')
                }
            },
            {
                path: '/survey/:surveyId',
                component: require('./Views/Home/survey')
            }
        ]
    },
    getMenu
};