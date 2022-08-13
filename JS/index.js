#!/usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const fetch = require("node-fetch");
const fetchSync = require("sync-fetch");
const readline = require("readline");
const chalk = require("chalk");
const chalkPipe = require("chalk-pipe");
const favorites = require("./favorites.json");
const utf8 = require("utf8");
const Table = require("cli-table");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let terminalWidth = process.stdout.columns;

process.stdout.on("resize", () => {
  terminalWidth = process.stdout.columns;
});

const inputSymbol = ">";
const userName = "Survivor"; // * Change it to ur nickname.
const maxListLength = 100;
/**
 * * maxListLength = INTEGER;
 * ? Change integer as u like, recommended (1-500)
 * ! If u don't want limit list change integer to 0
 */

const color = (clr, text) => chalkPipe(clr)(text);
/**
 * * ----- * https://github.com/chalk/chalk
 * * ----- * https://github.com/LitoMore/chalk-pipe
 * * ----- * https://github.com/marak/colors.js
 * ! change color inside quote.
 * ? Colors:
 * * ----- * black
 * * ----- * red
 * * ----- * green
 * * ----- * yellow
 * * ----- * blue
 * * ----- * magenta
 * * ----- * cyan
 * * ----- * white
 * * ----- * gray
 * * for background colors => bgRed...
 * ? Styles:
 * * ----- * reset
 * * ----- * bold
 * * ----- * dim
 * * ----- * italic
 * * ----- * underline
 * * ----- * inverse
 * * ----- * hidden
 * * ----- * strikethrough
 * ? Extras:
 * * ----- * rainbow
 * * ----- * zebra
 * * ----- * america
 * * ----- * random
 */
const titleClr = "green";
const primaryClr = (text) => color("green", text);
const primaryBoldClr = (text) => color("green.bold", text);
const secondaryClr = (text) => color("magenta", text);
const secondaryBoldClr = (text) => color("magenta.bold", text);
const symbolClr = (text) => color("magenta.bold", text);
const optionClr = (text) => color("yellow", text);
const commentClr = (text) => color("gray", text);
const paramClr = (text) => color("cyan", text);
const alertClr = (text) => color("red.bold", text);
const passwordClr = (text) => color("red.bold", text);
const favoriteClr = (text) => color("yellow", text);
const favoriteBgClr = (text) => color("bgYellow.black.bold", text);
const favoriteNumberClr = (text) => color("yellow.bold", text);
const numberClr = (text) => color("cyan.bold", text);
const linkClr = (text) => color("blue.underline", text);

const joinServer = (ip, gamePort, port, name = userName) => {
  /**
   * TODO: locate dayz-launcher.sh instead of using static path
   * * --debug for track missing mods etc...
   */
  return `./dayz-linux-cli-launcher/dayz-launcher.sh --debug --server ${ip}:${gamePort} --port ${port} --launch --name ${name}`;
};

const servers = async () => {
  try {
    const url = "https://dayzsalauncher.com/api/v1/launcher/servers/dayz";
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};

const serverIP = (ip) => {
  try {
    const url = `https://freeipapi.com/api/json/${ip}`;
    const res = fetchSync(url);
    const data = res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};

function handleFavorite(action, server) {
  const fileName = "dayz-linux-cli-launcher/JS/favorites.json";
  try {
    const json = fs.readFileSync(fileName, { encoding: "utf8" });
    const data = JSON.parse(json);
    const result = data.result;

    const checkExistence = result.find(
      (obj) =>
        obj.endpoint.ip === server.endpoint.ip &&
        obj.endpoint.port === server.endpoint.port
    );

    // * ADD
    if (action === "add") {
      if (typeof checkExistence === "object") {
        console.log(
          `${chalk.inverse(server.name)} ${primaryBoldClr("is in favorites!")}`
        );
        return;
      }
      result.push(server);
      console.log(
        `${primaryBoldClr("Added to favorites:")} ${chalk.inverse(
          `${server.name}`
        )}`
      );
    }
    // * REMOVE
    if (action === "remove") {
      if (typeof checkExistence !== "object") {
        console.log(
          `${chalk.inverse(server.name)} ${alertClr("is not favorited!")}`
        );
        return;
      }

      const indexOfServer = data.result.findIndex(
        (obj) =>
          obj.endpoint.ip === server.endpoint.ip &&
          obj.endpoint.port === server.endpoint.port
      );
      result.splice(indexOfServer, 1);
      console.log(
        `${alertClr("Removed from favorites:")} ${chalk.inverse.strikethrough(
          `${server.name}`
        )}`
      );
    }
    //                                                //
    const jsonStringify = JSON.stringify(data, null, 2);
    fs.writeFileSync(fileName, jsonStringify, "utf-8");
  } catch (err) {
    console.log(err);
  }
}

const launchDayz = (server) => {
  const ip = server.endpoint.ip;
  const port = server.endpoint.port;
  const gamePort = server.gamePort;
  rl.question(
    `${primaryClr(
      `Do you want to join ${secondaryBoldClr(server.name)}? ${optionClr(
        `(y/n ${commentClr(`| y = default`)})`
      )}\n${symbolClr(inputSymbol)} `
    )}`,
    (join) => {
      if (
        join.toLocaleLowerCase() === "n" ||
        join.toLocaleLowerCase() === "no"
      ) {
        rl.close();
        return;
      }

      rl.question(
        `${primaryClr("Name")} ${optionClr(
          `(default = ${chalk.bold(`${userName}`)}):`
        )}\n${symbolClr(inputSymbol)} `,
        (name) => {
          if (name.length < 3) name = userName;
          console.log(primaryBoldClr(`${server.name}`));
          console.log(
            `./dayz-linux-cli-launcher/dayz-launcher.sh ${chalk.red.bold(
              "--debug"
            )} --server ${chalk.magenta.bold(
              `${ip}:${gamePort}`
            )} --port ${chalk.blue.bold(
              port
            )} --launch --name ${chalk.yellow.bold(name)}`
          );
          shell.exec(joinServer(ip, gamePort, port, name));
          rl.close();
        }
      );
    }
  );
};

const serverNameFilter = (server, stringSlicer = 19) => {
  const checkExistence = favorites.result.find(
    (obj) =>
      obj.endpoint.ip === server.endpoint.ip &&
      obj.endpoint.port === server.endpoint.port
  );

  let name = server.name;
  let serverName = server.password ? `${passwordClr("🔒")}${name}` : name;
  if (name.length > terminalWidth - stringSlicer) {
    if (name.length > (terminalWidth - stringSlicer) * 2) {
      serverName = `${
        name.slice(0, (terminalWidth - stringSlicer) * 2) - 5
      }...`;
    }
    let partOne = name.slice(0, terminalWidth - stringSlicer);
    let partTwo = name.slice(terminalWidth - stringSlicer);
    serverName = `${partOne}\n${partTwo}`;
  }

  return typeof checkExistence === "object"
    ? favoriteClr(`${passwordClr("♥ ")}${serverName}`)
    : serverName;
};

(async () => {
  const data = await servers();
  rl.question(`${primaryClr("Search:")} `, (input) => {
    const resultObject = {};
    const resultArray = [];
    const favoritesArray = [];
    const paramsArray = [];
    const inputArray = [];

    let checkQoute = (input.match(/"/g) || []).length;

    let quoteCutter, quote, nonquote, bracket;
    if (checkQoute >= 2) {
      quoteCutter = input.trim().split('"');
      quote = input.trim().split('"')[1];
    }

    nonquote = input.replace(`"${quote}"`, "");

    const searchArray = nonquote.trim().split(" ");
    if (typeof quote === "string") searchArray.unshift(quote);

    searchArray.map((word, index) => {
      if (!word.startsWith("range(") && word.match(/[0-9]+\)/)) return;
      if (word.match(/range\([0-9]+/)) {
        paramsArray.push(
          `${word}${
            typeof searchArray[index + 1] !== "undefined"
              ? searchArray[index + 1]
              : ""
          }`
        );
        return;
      }
      if (
        word.startsWith("-") ||
        word.startsWith("+") ||
        word.startsWith("min=") ||
        word.startsWith("max=")
      ) {
        paramsArray.push(word);
        return;
      }
      inputArray.push(word);
    });

    const filtered = data.result.filter((result) =>
      inputArray.find((word) =>
        result.name.toLowerCase().includes(word.toLowerCase())
      )
    );

    const newData = Object.keys(filtered).length !== 0 ? filtered : data.result; // Backup

    const sortedByPlayers = newData.sort((a, b) => {
      return b.players - a.players;
    });

    const mapServers = sortedByPlayers.map((server) => {
      const checkExistence = favorites.result.find(
        (obj) =>
          obj.endpoint.ip === server.endpoint.ip &&
          obj.endpoint.port === server.endpoint.port
      );

      // * Filtring by params

      const favParams = ["favorites", "favorite", "fav"];

      let minPlayers, maxPlayers;

      paramsArray.find((param) => {
        if (param.startsWith("range(") && param.endsWith(")")) {
          let splitter = ",";
          if (param.includes("-")) splitter = "-";
          const [min, max] = param.slice(6, -1).split(splitter);
          minPlayers = parseInt(min);
          maxPlayers = parseInt(max);
        }
      });
      paramsArray.find((param) => {
        if (param.startsWith("min=")) {
          const [text, min] = param.split("min=");
          minPlayers = parseInt(min);
        }
        if (param.startsWith("max=")) {
          const [text, max] = param.split("max=");
          maxPlayers = parseInt(max);
        }
      });

      if (server.players < minPlayers || server.players > maxPlayers) return;
      if (
        paramsArray.includes(`max=${maxPlayers}`) &&
        server.players > maxPlayers
      )
        return;
      if (
        paramsArray.includes(`min=${minPlayers}`) &&
        server.players < minPlayers
      )
        return;
      if (paramsArray.includes("-empty") && server.players === 0) return;
      if (paramsArray.includes("-full") && server.players === server.maxPlayers)
        return;
      if (paramsArray.includes("-password") && server.password === true) return;
      if (
        favParams.find((fav) => paramsArray.includes(`+${fav}`)) &&
        typeof checkExistence !== "object"
      )
        return;
      if (
        favParams.find((fav) => paramsArray.includes(`-${fav}`)) &&
        typeof checkExistence === "object"
      )
        return;

      if (paramsArray.includes("-3pp") && server.firstPersonOnly === false)
        return;
      if (paramsArray.includes("+3pp") && server.firstPersonOnly === true)
        return;

      if (
        !paramsArray.includes("+foreign") &&
        server.name !== utf8.encode(server.name)
      )
        return;
      //                                                                //
      if (typeof checkExistence === "object") {
        favoritesArray.push(server);
        return;
      }
      resultArray.push(server);
    });

    const serversList = favoritesArray.concat(resultArray);

    const table = new Table({
      style: { head: [titleClr] },
      head: ["ID", "Server Name", "Players"],
      colWidths: [5, terminalWidth - 18, 9],
    });

    const pingTable = new Table({
      style: { head: [titleClr] },
      head: ["ID", "Server Name", "Players", "Ping"],
      colWidths: [5, terminalWidth - 25, 9, 6],
    });
    let ping;

    const displayList = serversList.map((server, index) => {
      const checkExistence = favorites.result.find(
        (obj) =>
          obj.endpoint.ip === server.endpoint.ip &&
          obj.endpoint.port === server.endpoint.port
      );

      if (
        typeof checkExistence !== "object" &&
        maxListLength > 0 &&
        index >= maxListLength
      )
        return;

      index += 1;

      if (paramsArray.includes("+ping")) {
        ping = shell.exec(
          `ping -f -c 1 -w 1 -i 0.002 ${server.endpoint.ip} | cut -d "/" -s -f5`,
          { silent: true }
        );
      }

      const serverName = server.password
        ? `${passwordClr("🔒")}${server.name}`
        : server.name;

      if (paramsArray.includes("+ping")) {
        pingTable.push([
          `${index < 10 ? " " : ""}${
            typeof checkExistence === "object"
              ? favoriteNumberClr(index)
              : numberClr(index)
          }`,
          typeof checkExistence === "object"
            ? favoriteClr(`${passwordClr("♥ ")}${serverName}`)
            : serverName,
          secondaryClr(
            `${chalk.bold(server.players)}/${chalk.bold(server.maxPlayers)}`
          ),
          Number.isInteger(parseInt(ping))
            ? paramClr(chalk.bold(parseInt(ping)))
            : alertClr(chalk.bold(" ✖")),
        ]);
      }

      table.push([
        `${index < 10 ? " " : ""}${
          typeof checkExistence === "object"
            ? favoriteNumberClr(index)
            : numberClr(index)
        }`,
        typeof checkExistence === "object"
          ? favoriteClr(`${passwordClr("♥ ")}${serverName}`)
          : serverName,
        secondaryClr(
          `${chalk.bold(server.players)}/${chalk.bold(server.maxPlayers)}`
        ),
      ]);

      resultObject[index] = server;
    });

    //* Displays Table
    console.log(
      paramsArray.includes("+ping") ? pingTable.toString() : table.toString()
    );

    const listLength = Object.keys(resultObject).length;

    if (listLength === 0) {
      console.log(
        alertClr(`
      Server not found in API!      

      ${primaryBoldClr("Servers:")} ${secondaryClr(
          inputArray.length > 0 ? inputArray.join(", ") : "Any"
        )}
      ${primaryBoldClr(`${" "}Params:`)} ${paramClr(paramsArray.join(", "))}
      `)
      );
      rl.close();
      return;
    }
    //                                                //
    rl.question(
      `${primaryClr("Choose server")} ${optionClr(
        `(1-${listLength}):`
      )}\n${symbolClr(inputSymbol)} `,
      (answer) => {
        const [number, param] = answer.trim().split(" ");

        if (number < 1 || number > listLength || Number.isInteger(number)) {
          console.log("Server not found!");
          rl.close();
          return;
        }

        const server = resultObject[number];
        const ip = server.endpoint.ip;
        const port = server.endpoint.port;
        const gamePort = server.gamePort;

        if (param === "+") {
          handleFavorite("add", server);
        }
        if (param === "-") {
          handleFavorite("remove", server);
        }

        const info = (topic, detail) => {
          const topicMaxLength = "Password Protected".length;
          const topicLength = topicMaxLength - topic.length;
          return `${
            topic !== "Mods"
              ? " ".repeat(topicLength)
              : modsArray.length > 0
              ? ""
              : " ".repeat(topicLength)
          }${primaryBoldClr(topic)} ${secondaryClr(detail)}`;
        };

        const capitalizeFirstLetter = (string) => {
          string = `${string}`;
          return string.charAt(0).toUpperCase() + string.slice(1);
        };

        let longestModNameLength =
          server.mods.length > 0
            ? server.mods.reduce((r, e) =>
                r.name.length < e.name.length ? e : r
              )
            : 0;

        let longestModName =
          server.mods.length > 0 ? longestModNameLength.name.length : 0;

        longestModName += 2;

        const infoTable = new Table({ colWidths: [14, terminalWidth - 17] });
        const modsTable = new Table({
          style: { head: [titleClr] },
          head: ["Mod", "URL"],
          colWidths: [longestModName, terminalWidth - longestModName - 3],
        });

        const modsArray = [];

        const mods = server.mods.map((mod, index) => {
          modsTable.push([
            secondaryBoldClr(mod.name),
            linkClr(
              `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.steamWorkshopId}`
            ),
          ]);
        });

        if (param === "i") {
          const checkExistence = favorites.result.find(
            (obj) => obj.endpoint.ip === ip && obj.endpoint.port === port
          );
          const favorited = typeof checkExistence === "object";

          const ipInfo = serverIP(ip);
          const ping = shell.exec(
            `ping -f -c 1 -w 5 -i 0.002 ${ip} | cut -d "/" -s -f5`,
            { silent: true }
          );

          infoTable.push([
            primaryBoldClr("Name"),
            favorited
              ? favoriteClr(serverNameFilter(server))
              : secondaryClr(serverNameFilter(server)),
          ]);
          infoTable.push([
            primaryBoldClr("Players"),
            secondaryClr(`${server.players}/${server.maxPlayers}`),
          ]);
          infoTable.push([
            primaryBoldClr("Address"),
            secondaryClr(
              `${ip}:${port} ${commentClr(
                "(Game Port)"
              )}\n${ip}:${gamePort} ${commentClr("(Query Port)")}`
            ),
          ]);
          infoTable.push([
            primaryBoldClr("Ping"),
            Number.isInteger(parseInt(ping))
              ? secondaryClr(parseInt(ping))
              : alertClr(chalk.bold("✖")),
          ]);
          infoTable.push([
            primaryBoldClr("Country"),
            secondaryClr(ipInfo.countryName),
          ]);
          infoTable.push([
            primaryBoldClr("Map"),
            secondaryClr(capitalizeFirstLetter(server.map)),
          ]);
          infoTable.push([primaryBoldClr("Time"), secondaryClr(server.time)]);
          infoTable.push([
            primaryBoldClr("Version"),
            secondaryClr(server.version),
          ]);
          infoTable.push([
            primaryBoldClr("Third Person"),
            secondaryClr(capitalizeFirstLetter(!server.firstPersonOnly)),
          ]);

          if (modsTable.length === 0)
            infoTable.push([primaryBoldClr("Mods"), secondaryClr("None")]);

          console.log(infoTable.toString());
          if (modsTable.length > 0) console.log(modsTable.toString());

          if (favorited) {
            rl.question(
              `${alertClr(
                `Remove from favorites? ${optionClr(
                  `(y/n ${commentClr(`| n = default`)})`
                )}\n${symbolClr(inputSymbol)} `
              )}`,
              (answer) => {
                if (
                  answer.toLocaleLowerCase() === "y" ||
                  answer.toLocaleLowerCase() === "yes"
                ) {
                  handleFavorite("remove", server);
                }
                launchDayz(server);
              }
            );
          }
          rl.question(
            `${primaryBoldClr(
              `Add to favorites? ${optionClr(
                `(y/n ${commentClr(`| n = default`)})`
              )}\n${symbolClr(inputSymbol)} `
            )}`,
            (answer) => {
              if (
                answer.toLocaleLowerCase() === "y" ||
                answer.toLocaleLowerCase() === "yes"
              ) {
                handleFavorite("add", server);
              }
              launchDayz(server);
            }
          );
        }
        launchDayz(server);
      }
    );
  });
})();
