import { Socket } from "../types";

const sockets: { [key: string]: Socket } = {
    showdown: {
        name: "Showdown",
        link: "https://play.pokemonshowdown.com",
        ip: "sim3.psim.us",
        server: "wss://sim3.psim.us/showdown/websocket",
    },
    dawn: {
        name: "Dawn",
        link: "dawn.psim.us",
        ip: "server.dawn-ps.com:8080",
        server: "ws://server.dawn-ps.com:8080/showdown/websocket",
    },
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
    staraptorshowdown: {
        name: "Staraptor Showdown",
        link: "https://staraptorshowdown.com/",
        ip: "api.staraptorshowdown.com:443",
        server: "ws://api.staraptorshowdown.com/showdown/websocket"
    },
pokeathlon: {
        name: "Pokeathlon",
        link: "https://play.pokeathlon.com/",
        ip: "sim.pokeathlon.com:8000",
        server: "ws://sim.pokeathlon.com/showdown/websocket"
    },
};

export default sockets;
