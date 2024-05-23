import { Socket } from "../types";

const sockets: { [key: string]: Socket } = {
    showdown: {
        name: "Showdown",
        link: "https://play.pokemonshowdown.com",
        ip: "sim3.psim.us:8000",
        server: "ws://sim3.psim.us:8000/showdown/websocket",
    },
    dawn: {
        name: "Dawn",
        link: "dawn.psim.us",
        ip: "server.dawn-ps.com:8080",
        server: "ws://server.dawn-ps.com:8080/showdown/websocket",
    },
    clover: {
        name: "Clover",
        link: "https://clover.weedl.es",
        ip: "clover.weedl.es:8000",
        server: "ws://clover.weedl.es:8000/showdown/websocket",
    }, //THIS COULD BE THE ISSUE
    radicalred: {
        name: "RadicalRed",
        link: "https://play.radicalred.net/",
        ip: "sim.radicalred.net:8000",
        server: "ws://sim.radicalred.net:8000/showdown/websocket",
    },
    dl: {
        name: "DL",
        link: "https://dl.psim.us/",
        ip: "dlsim.radicalred.net:8000",
        server: "ws://dlsim.radicalred.net:8000/showdown/websocket",
    },
};

export default sockets;
