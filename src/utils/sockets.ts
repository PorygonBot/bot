import { Socket } from "../types";

const sockets: { [key: string]: Socket } = {
    showdown: {
        name: 'Showdown',
        link: 'https://play.pokemonshowdown.com',
        ip: 'sim3.psim.us:8000',
        server: 'ws://sim3.psim.us:8000/showdown/websocket',
    },
    sports: {
        name: 'Sports',
        link: 'http://sports.psim.us',
        ip: '54.202.92.100:8000',
        server: 'ws://54.202.92.100:8000/showdown/websocket',
    },
    automatthic: {
        name: 'Automatthic',
        link: 'http://automatthic.psim.us',
        ip: '185.224.89.75:8000',
        server: 'ws://185.224.89.75:8000/showdown/websocket',
    },
    dawn: {
        name: 'Dawn',
        link: 'dawn.psim.us',
        ip: 'server.dawn-ps.com:8080',
        server: 'ws://server.dawn-ps.com:8080/showdown/websocket',
    },
    drafthub: {
        name: 'Drafthub',
        link: 'http://drafthub.psim.us',
        ip: '128.199.170.203:8000',
        server: 'ws://128.199.170.203:8000/showdown/websocket',
    },
    clover: {
        name: 'Clover',
        link: 'https://clover.weedl.es',
        ip: 'clover.weedl.es:8000',
        server: 'ws://clover.weedl.es:8000/showdown/websocket',
    },
    radicalred: {
        name: 'RadicalRed',
        link: 'radicalred.net',
        ip: 'sim.radicalred.net:8000',
        server: 'ws://sim.radicalred.net:8000/showdown/websocket',
    },
    fantasy: {
        name: "Fantasy",
        link: 'http://fantasyclient.herokuapp.com/',
        ip: 'fantasy-showdown.herokuapp.com:8000',
        server: 'ws://fantasy-showdown.herokuapp.com:8000/showdown/websocket'
    },
    legacyvgc: {
        name: "Legacy VGC",
        link: "http://legacyvgc.psim.us/",
        ip: "35.175.128.48:8000",
        server: "ws://35.175.128.48:8000/showdown/websocket"
    },
};

export default sockets;
