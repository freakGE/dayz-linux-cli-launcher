#!/usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const fetch = require("node-fetch");
const fetchSync = require("sync-fetch");
const readline = require("readline");
const colors = require("@colors/colors");
const utf8 = require("utf8");
const Table = require("cli-table3");

const favorites = require("./favorites.json");
const config = require("./config.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let terminalWidth = process.stdout.columns;

process.stdout.on("resize", () => {
  terminalWidth = process.stdout.columns;
});

/**
 * * ----- * https://github.com/DABH/colors.js
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

colors.setTheme({
  primaryClr: "green",
  primaryBoldClr: ["green", "bold"],
  secondaryClr: "magenta",
  secondaryBoldClr: ["magenta", "bold"],
  symbolClr: ["magenta", "bold"],
  optionClr: "yellow",
  commentClr: "gray",
  paramClr: "cyan",
  alertClr: ["red", "bold"],
  passwordClr: ["red", "bold"],
  favoriteClr: "yellow",
  favoriteBgClr: ["grbgYelloween", "black", "bold"],
  favoriteNumberClr: ["yellow", "bold"],
  numberClr: ["cyan", "bold"],
  linkClr: ["blue", "underline"],
});

const inputSymbol = ">";
const SEARCH = "s";
const REFRESH = "r";
const EXIT = "e";

const args = process.argv.slice(2);
if (args.includes("--setup") || args.includes("-s")) setupConfig();

if (args.includes("-h") || args.includes("--help")) {
  const pushToTable = (table, key, value) => {
    table.push({ [colors.numberClr(key)]: value });
  };

  const manipulateId = new Table({
    style: { head: [titleClr] },
    colWidths: [3, terminalWidth - 6],
    wordWrap: true,
  });
  const flags = new Table({
    style: { head: [titleClr] },
    colWidths: [17, terminalWidth - 20],
    wordWrap: true,
  });

  // ManipulateId
  pushToTable(manipulateId, "+", "Adds server in favorites for ex: 1 +");
  pushToTable(manipulateId, "-", "Removes server from favorites for ex: 1 -");
  pushToTable(
    manipulateId,
    "i",
    `To see more information about server add "i" to ID for ex: 1 i, Where u can read everything about server. From here u can also see which mods are server using, u can simple click url(s) and subscribe/unsubscribe them. U can add/remove favorites from there as well.`
  );
  // Flags
  pushToTable(
    flags,
    "min=x, max=y",
    "min/max is filtring server by players, so if u want server with minimum 25 player, type min=25, server with maximum 75 players? max=75, u can also use both to find server above 25 and lower 75 players same time."
  );
  pushToTable(
    flags,
    "range(min,max), range(min-max)",
    "range from min to max, basically its same as above but u have to enter both min and max. range(25,75), range(25-75)"
  );
  pushToTable(flags, "-3pp", "hides third person servers");
  pushToTable(flags, "+3pp", "shows only third person servers");
  pushToTable(flags, "-empty", "hides empty servers");
  pushToTable(flags, "-full", "hides full servers");
  pushToTable(flags, "-password", "hides password secured servers");
  pushToTable(flags, "+fav", "shows only favorites");
  pushToTable(flags, "-fav", "hides all favorites");
  pushToTable(
    flags,
    "+ping",
    "Shows ping on server (Not recommended on large scale searchs! Unless u have time to wait...), also u can see ping on server for faster result by going to server information >> 'ID i'"
  );
  pushToTable(
    flags,
    "+foreign",
    "shows foreign servers (Not recommended! it breaks whole grid system, I have zero experience encoding/decoding utf-8 so before I will learn smth about it, I have decided to hide them as default)"
  );

  console.log(colors.primaryBoldClr("Command Line Options"));
  console.log(`    ${colors.numberClr(`-h 
    --help`)}
      Print this help text.

    ${colors.numberClr(`-s
    --setup`)}
      Setup config file.

    ${colors.numberClr(`-d
    --debug`)}
      Print debug messages to output.

    ${colors.secondaryBoldClr(`Ex:`)}
      node index.js --setup
      node index.js --debug`);

  console.log(colors.primaryBoldClr("\nManipulate ID"));
  console.log(manipulateId.toString());

  console.log(colors.primaryBoldClr("\nFlags"));
  console.log(flags.toString());
  console.log(
    `   ${colors.secondaryBoldClr(`Ex:`)}
     ${colors.primaryBoldClr(
       "Search:"
     )} Dayz Aftermath EU Rearmed range(15,50) -fav -3pp -password`
  );

  process.exit(0);
}

const PATH = config.path;
const userName = config.userName;
const maxListLength = config.maxListLength;

/**
 * * maxListLength = INTEGER;
 * ? Change integer as u like, recommended (1-500)
 * ! If u don't want limit list change integer to 0
 */

if (PATH.length === 0 && !(args.includes("--setup") || args.includes("-s"))) {
  console.log(
    `You must setup config before executing script! add argument "${colors.alertClr(
      "--setup"
    )}" or "${colors.alertClr("-s")}" to the script`
  );
  console.log(
    `To setup config file u have to be inside of ${colors.alertClr(
      "dayz-linux-cli-launcher/JS/"
    )}`
  );
  console.log(
    `Then run index.js with argument >>> ${colors.primaryClr(
      `node index.js --setup`
    )}`
  );
  process.exit(0);
}

shell.cd(PATH);

//                                                          //

const clearTerminal = () => {
  process.stdout.write("\033c");
};

const joinServer = (ip, gamePort, port, name = userName) => {
  const PWD = shell.exec("pwd", { silent: true }).stdout.slice(0, -1);
  console.log(
    `${PWD}/dayz-launcher.sh${
      args.includes("-d") || args.includes("--debug")
        ? colors.red.bold(" --debug")
        : ""
    } --server ${colors.magenta.bold(
      `${ip}:${gamePort}`
    )} --port ${colors.blue.bold(port)} --launch --name '${colors.yellow.bold(
      name
    )}'`
  );

  const joinToServer = shell.exec(
    `./dayz-launcher.sh ${
      args.includes("-d") || args.includes("--debug") ? `--debug` : ""
    } --server ${ip}:${gamePort} --port ${port} --launch --name '${name}'`,
    { silent: true }
  );

  let display = joinToServer.stdout.split("\n");
  let modMissing = false;
  for (const line of display) {
    let l = line;
    l = l.replace("[dayz-launcher.sh][info]", "");
    l = l.replace("[dayz-launcher.sh][debug]", "");
    l.trim();

    if (l.includes("Querying")) {
      if (l.includes("API")) {
        let server = l.replace("Querying API for server: ", "").trim();
        console.log(
          `${colors.primaryBoldClr(
            "Querying API for server:"
          )} ${colors.numberClr(server)}`
        );
      } else {
        let [text, link] = l.trim().split(" ");
        console.log(`${colors.primaryBoldClr(text)} ${colors.linkClr(link)}`);
      }
    }

    if (l.match(/Mod [0-9]+ found: [a-zA-Z]+/)) {
      let modId = l.split("Mod ").join("").split(" found")[0].trim();
      let modName = l.split("found: ")[1].trim();

      console.log(
        colors.primaryBoldClr(
          `+ ${colors.numberClr(modId)} ${colors.secondaryClr(
            `(${colors.secondaryBoldClr(modName)})`
          )}`
        )
      );
    }

    if (l.includes("Subscribe the mod here")) {
      modMissing = true;
      let url = l.split(`Subscribe the mod here: `)[1];
      let id = url.split("id=")[1];

      console.log(
        colors.alertClr(
          `- ${colors.numberClr(id)} Subscribe the mod here: ${colors.linkClr(
            url
          )}`
        )
      );
    }

    if (l.includes("Launching DayZ"))
      console.log(
        `\n${colors.primaryBoldClr(`Launching`)} ${colors.secondaryBoldClr(
          "DayZ"
        )}`
      );
  }
  if (modMissing === true) {
    console.log(`\n${colors.alertClr(`Missing Mods!`)}`);
    process.exit(0);
  }

  return shell.exec(
    `./dayz-launcher.sh --server ${ip}:${gamePort} --port ${port} --launch --name '${name}'`,
    { silent: true }
  );
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
  const fileName = securedPath("favorites.json");
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
          `${colors.inverse(server.name)} ${colors.primaryBoldClr(
            "is in favorites!"
          )}`
        );
        return;
      }
      result.push(server);
      console.log(
        `${colors.primaryBoldClr("Added to favorites:")} ${colors.inverse(
          `${server.name}`
        )}`
      );
    }
    // * REMOVE
    if (action === "remove") {
      if (typeof checkExistence !== "object") {
        console.log(
          `${colors.inverse(server.name)} ${colors.alertClr(
            "is not favorited!"
          )}`
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
        `${colors.alertClr(
          "Removed from favorites:"
        )} ${colors.inverse.strikethrough(`${server.name}`)}`
      );
    }
    //                                                //
    const jsonStringify = JSON.stringify(data, null, 2);
    fs.writeFileSync(fileName, jsonStringify, "utf-8");
  } catch (err) {
    console.log(err);
  }
}

function isInt(value) {
  return (
    !isNaN(value) &&
    (function (x) {
      return (x | 0) === x;
    })(parseFloat(value))
  );
}

function securedPath(file) {
  const PWD = shell.exec("pwd", { silent: true }).stdout.slice(0, -4);
  return config.path.length > 0
    ? `${config.path}/JS/${file}`
    : `${PWD}/JS/${file}`;
}

function setupConfig() {
  const indexExist = shell.test("-f", "index.js"); // exists
  if (!indexExist) {
    console.log(
      `To setup config file u have to be inside of ${colors.alertClr(
        "dayz-linux-cli-launcher/JS/"
      )}`
    );
    process.exit(0);
  }

  const PWD = shell.exec("pwd", { silent: true }).stdout.slice(0, -1);
  let IngameName = config.userName;
  let maxLength = config.maxListLength;

  const fileName = securedPath("config.json");
  try {
    const json = fs.readFileSync(fileName);
    const data = JSON.parse(json);

    rl.question(
      `${colors.primaryClr("Ingame name")} ${colors.optionClr(
        `(default = ${colors.bold(`${IngameName}`)}):`
      )}\n${colors.symbolClr(inputSymbol)} `,
      (name) => {
        if (name.length > 3) IngameName = name;

        rl.question(
          `${colors.primaryClr(
            "Maximum servers list length"
          )} ${colors.optionClr(
            `(default = ${colors.bold(`${maxLength}`)}):`
          )}\n${colors.symbolClr(inputSymbol)} `,
          (length) => {
            if (length === "") rl.close();
            if (isInt(length)) {
              maxLength = length;
              rl.close();
            }

            console.log(`Please enter ${colors.alertClr("integer!")}`);
            rl.setPrompt(
              `${colors.primaryClr(
                "Maximum servers list length"
              )} ${colors.optionClr(
                `(default = ${colors.bold(`${maxLength}`)}):`
              )}\n${colors.symbolClr(inputSymbol)} `
            );
            rl.prompt();
            rl.on("line", (length) => {
              if (length === "") rl.close();
              if (isInt(length)) {
                maxLength = length;
                rl.close();
              }

              console.log(
                `"${colors.alertClr(length)}" is not ${colors.alertClr(
                  "integer!"
                )}`
              );
              rl.setPrompt(
                `${colors.primaryClr(
                  "Maximum servers list length"
                )} ${colors.optionClr(
                  `(default = ${colors.bold(`${maxLength}`)}):`
                )}\n${colors.symbolClr(inputSymbol)} `
              );
              rl.prompt();
            });
          }
        );

        rl.on("close", () => {
          data.userName = IngameName;
          data.maxListLength = maxLength;
          data.path = PWD.slice(0, -3);
          data.script = `node ${PWD}/index.js`;

          let firstColWidth = "List length (Max)".length + 2;
          let secondColWidth =
            `${data.script}`.length > `${data.userName}`.length
              ? `${data.script}`.length + 2
              : `${data.userName}`.length + 2;

          const scriptTable = new Table({
            style: { head: [titleClr] },
            head: ["Key", "Value"],
            colWidths: [firstColWidth, secondColWidth],
          });

          scriptTable.push([
            colors.primaryBoldClr("Ingame Name"),
            colors.secondaryClr(data.userName),
          ]);
          scriptTable.push([
            colors.primaryBoldClr("List length (Max)"),
            colors.secondaryClr(data.maxListLength),
          ]);
          scriptTable.push([
            colors.primaryBoldClr("Script"),
            colors.secondaryClr(data.script),
          ]);
          console.log(scriptTable.toString());

          const jsonStringify = JSON.stringify(data, null, 2);
          fs.writeFileSync(fileName, jsonStringify);

          process.exit(0);
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
}

const launchDayz = (server) => {
  const ip = server.endpoint.ip;
  const port = server.endpoint.port;
  const gamePort = server.gamePort;
  rl.question(
    `${colors.primaryClr(
      `Do you want to join ${colors.secondaryBoldClr(
        server.name
      )}? ${colors.optionClr(
        `(y/n ${colors.commentClr(`| y = default`)})`
      )}\n${colors.symbolClr(inputSymbol)} `
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
        `${colors.primaryClr("Name")} ${colors.optionClr(
          `(default = ${colors.bold(`${userName}`)}):`
        )}\n${colors.symbolClr(inputSymbol)} `,
        (name) => {
          if (name.length < 3) name = userName;
          console.log(colors.primaryBoldClr(`${server.name}`));
          joinServer(ip, gamePort, port, name);
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
  let serverName = server.password
    ? `${colors.passwordClr("🔒")}${name}`
    : name;
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
    ? colors.favoriteClr(`${colors.passwordClr("♥ ")}${serverName}`)
    : serverName;
};

(async () => {
  const chooseServer = async (input) => {
    const data = await servers();
    const resultObject = {};
    const resultArray = [];
    const favoritesArray = [];
    const paramsArray = [];
    const inputArray = [];

    const searchArray = input.trim().split(" ");

    searchArray.map((word, index) => {
      if (!word.startsWith("range(") && word.match(/[0-9]+\)/)) return;
      if (
        word.match(/range\([0-9]+/) ||
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

    let bracketsRegEx = /\(|\)|\[|\]/g;

    if (inputArray.length > 1) {
      inputArray.find((word, index) => {
        if (word.length === 0) {
          inputArray.splice(index, 1);
        }
      });
    }

    const dataList = [];
    let foundServer = false;
    const dataListFilterEvery = data.result.filter((result, index) => {
      if (inputArray.length === 1 && inputArray[0].length === 0) return;
      const numberIncluded = inputArray.findIndex((i) => i.match(/[0-9]+/g));
      const serverName =
        numberIncluded === -1
          ? result.name
              .replace(bracketsRegEx, "")
              .replace(/[0-9]+/g, "")
              .replace(/\|/g, " ")
              .toLowerCase()
              .trim()
              .split(" ")
          : result.name
              .replace(bracketsRegEx, "")
              .replace(/\|/g, " ")
              .toLowerCase()
              .trim()
              .split(" ");

      const isEvery = inputArray.every(
        (word) =>
          serverName.find((sWord) => sWord === word.toLowerCase()) ||
          serverName.includes(word.toLowerCase())
      );

      if (isEvery) {
        dataList.push(result);
        foundServer = true;
      }
    });

    //* Plan B
    const matchedWords = [];
    let wordScore = 50;
    const dataListFilterSome = data.result.filter((result, index) => {
      let score = 100;
      let alreadyChecked = [];

      const numberIncluded = inputArray.findIndex((i) => i.match(/[0-9]+/g));
      const serverName =
        numberIncluded === -1
          ? result.name
              .replace(bracketsRegEx, "")
              .replace(/[0-9]+/g, "")
              .replace(/\|/g, " ")
              .toLowerCase()
              .trim()
              .split(" ")
          : result.name
              .replace(bracketsRegEx, "")
              .replace(/\|/g, " ")
              .toLowerCase()
              .trim()
              .split(" ");

      const isSome = inputArray.some(
        (word) =>
          serverName.find((sWord) => sWord === word.toLowerCase()) ||
          serverName.includes(word.toLowerCase())
      );

      if (foundServer === false && isSome) {
        inputArray.map((word) => {
          if (word.length === 0) return;
          serverName.map((sWord) => {
            if (sWord.length === 0) return;
            if (alreadyChecked.includes(word)) return;
            if (sWord.toLowerCase() === word.toLowerCase()) {
              score += wordScore; // wordScore * 2
              alreadyChecked.push(word);
            }
          });
        });
        result.score = score;
        matchedWords.push(result);
      }
    });
    const bestMatch =
      matchedWords.length > 0 &&
      matchedWords.reduce((r, e) => (r.score < e.score ? e : r));
    const bestMatchScore = matchedWords.length > 0 && bestMatch.score;

    const topMatches = matchedWords.map((result) => {
      if (inputArray.length === 1 && inputArray[0].length === 0) return;
      if (result.score >= bestMatchScore - wordScore) dataList.push(result);
    });

    const ratedData = [];
    const searchAlgorithm = dataList.map((result) => {
      let score = 100;
      let serverName = result.name.toLowerCase();
      let alreadyChecked = [];

      inputArray.find((word) => {
        serverName.split(" ").find((sWord) => {
          if (alreadyChecked.includes(word)) return;

          if (sWord.toLowerCase() === word.toLowerCase()) {
            score += wordScore * 2;
            alreadyChecked.push(word);
          }
        });
      });
      score += result.players;
      result.score = score;
      ratedData.push(result);
    });

    const sortedByScore = ratedData.sort((a, b) => {
      return b.score - a.score;
    });

    const sortedByPlayers = data.result.sort((a, b) => {
      return b.players - a.players;
    });

    const newData =
      Object.keys(sortedByScore).length !== 0 ? sortedByScore : sortedByPlayers; // If input is empty

    const mapServers = newData.map((server) => {
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
      wordWrap: true,
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
        ? `${colors.passwordClr("🔒")}${server.name}`
        : server.name;

      if (paramsArray.includes("+ping")) {
        pingTable.push([
          `${index < 10 ? " " : ""}${
            typeof checkExistence === "object"
              ? colors.favoriteNumberClr(index)
              : colors.numberClr(index)
          }`,
          typeof checkExistence === "object"
            ? colors.favoriteClr(`${colors.passwordClr("♥ ")}${serverName}`)
            : serverName,
          colors.secondaryClr(
            `${colors.bold(server.players)}/${colors.bold(server.maxPlayers)}`
          ),
          Number.isInteger(parseInt(ping))
            ? colors.paramClr(colors.bold(parseInt(ping)))
            : colors.alertClr(colors.bold(" ✖")),
        ]);
      }

      table.push([
        `${index < 10 ? " " : ""}${
          typeof checkExistence === "object"
            ? colors.favoriteNumberClr(index)
            : colors.numberClr(index)
        }`,
        typeof checkExistence === "object"
          ? colors.favoriteClr(`${colors.passwordClr("♥ ")}${serverName}`)
          : serverName,
        colors.secondaryClr(
          `${colors.bold(server.players)}/${colors.bold(server.maxPlayers)}`
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
        colors.alertClr(`
      Server not found in API!      

      ${colors.primaryBoldClr("Servers:")} ${colors.secondaryClr(
          inputArray.length > 0 ? inputArray.join(", ") : "Any"
        )}
      ${colors.primaryBoldClr(`${" "}Params:`)} ${colors.paramClr(
          paramsArray.join(", ")
        )}
      `)
      );
      rl.close();
      return;
    }
    //                                                //
    const searchParamsArray = [];
    const searchParams = (key, value) => {
      searchParamsArray.push(
        `${colors.favoriteNumberClr(key)} ${colors.commentClr(`(${value})`)}`
      );
    };

    searchParams("s", "Search");
    searchParams("r", "Refresh");
    searchParams("e", "Exit");

    console.log(` ${searchParamsArray.join(`${colors.symbolClr(" | ")}`)}`);

    const pickServer = () => {
      rl.question(
        `${colors.primaryClr("Choose server")} ${colors.optionClr(
          `(1-${listLength}):`
        )}\n${colors.symbolClr(inputSymbol)} `,
        (answer) => {
          if (answer === SEARCH) {
            clearTerminal();
            searchServer();
            return;
          }
          if (answer === REFRESH) {
            clearTerminal();
            console.log(`${colors.primaryClr("Search:")} ${input}`);
            searchServer(input);
            return;
          }
          if (answer === EXIT) {
            process.exit(0);
          }

          //
          const [number, param] = answer.trim().split(" ");

          if (number.length === 0) {
            console.log(colors.alertClr(`Enter the Server ID`));
            return pickServer();
          }

          if (!isInt(number)) {
            console.log(
              colors.alertClr(`"${colors.paramClr(number)}" is not an integer!`)
            );
            return pickServer();
          }

          if (number < 1 || number > listLength) {
            console.log(colors.alertClr(`Invalid Server ID`));
            return pickServer();
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
            }${colors.primaryBoldClr(topic)} ${colors.secondaryClr(detail)}`;
          };

          const capitalizeFirstLetter = (string) => {
            string = `${string}`;
            return string.charAt(0).toUpperCase() + string.slice(1);
          };

          const longestLength = (names) => {
            if (names.length === 0) return;
            if (typeof names === undefined) {
              console.log("no mods");
              return;
            }
            let longestModNameLength =
              names.length > 0
                ? names.reduce((r, e) =>
                    r.name.length < e.name.length ? e : r
                  )
                : 0;

            let longestModIdLength =
              names.length > 0
                ? names.reduce((r, e) =>
                    `${r.steamWorkshopId}`.length <
                    `${e.steamWorkshopId}`.length
                      ? e
                      : r
                  )
                : 0;

            return {
              name: longestModNameLength.name.length,
              steamWorkshopId:
                `https://steamcommunity.com/sharedfiles/filedetails/?id=${longestModIdLength.steamWorkshopId}`
                  .length,
            };
          };

          let longestModName =
            typeof longestLength(server.mods) === "undefined"
              ? 0
              : longestLength(server.mods).name + 2;
          let longestModId =
            typeof longestLength(server.mods) === "undefined"
              ? 0
              : longestLength(server.mods).steamWorkshopId + 2;
          let filtredModNameLength =
            longestModName + longestModId > terminalWidth - 4
              ? terminalWidth - longestModId - 3
              : longestModName;

          let filtredModIdLength =
            terminalWidth - longestModName - 3 > longestModId
              ? terminalWidth - longestModName - 3
              : longestModId;

          const infoTable = new Table({
            colWidths: [14, terminalWidth - 17],
          });
          const modsTable = new Table({
            style: { head: [titleClr] },
            head: ["Mod", "URL"],
            colWidths: [filtredModNameLength, filtredModIdLength],
          });

          const modsArray = [];

          const mods = server.mods.map((mod, index) => {
            let modName = mod.name;
            let stringSlicer = longestModId + 5;
            let name = mod.name;
            if (name.length > terminalWidth - stringSlicer) {
              modName = `${name.slice(0, terminalWidth - stringSlicer - 3)}...`;
            }

            modsTable.push([
              colors.secondaryBoldClr(modName),
              colors.linkClr(
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
              colors.primaryBoldClr("Name"),
              favorited
                ? colors.favoriteClr(serverNameFilter(server))
                : colors.secondaryClr(serverNameFilter(server)),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Players"),
              colors.secondaryClr(`${server.players}/${server.maxPlayers}`),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Address"),
              colors.secondaryClr(
                `${ip}:${port} ${colors.commentClr(
                  "(Game Port)"
                )}\n${ip}:${gamePort} ${colors.commentClr("(Query Port)")}`
              ),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Ping"),
              Number.isInteger(parseInt(ping))
                ? colors.secondaryClr(parseInt(ping))
                : colors.alertClr(colors.bold("✖")),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Country"),
              colors.secondaryClr(ipInfo.countryName),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Map"),
              colors.secondaryClr(capitalizeFirstLetter(server.map)),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Time"),
              colors.secondaryClr(server.time),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Version"),
              colors.secondaryClr(server.version),
            ]);
            infoTable.push([
              colors.primaryBoldClr("Third Person"),
              colors.secondaryClr(
                capitalizeFirstLetter(!server.firstPersonOnly)
              ),
            ]);

            if (modsTable.length === 0)
              infoTable.push([
                colors.primaryBoldClr("Mods"),
                colors.secondaryClr("None"),
              ]);

            console.log(infoTable.toString());
            if (modsTable.length > 0) console.log(modsTable.toString());

            if (favorited) {
              rl.question(
                `${colors.alertClr(
                  `Remove from favorites? ${colors.optionClr(
                    `(y/n ${colors.commentClr(`| n = default`)})`
                  )}\n${colors.symbolClr(inputSymbol)} `
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
              `${colors.primaryBoldClr(
                `Add to favorites? ${colors.optionClr(
                  `(y/n ${colors.commentClr(`| n = default`)})`
                )}\n${colors.symbolClr(inputSymbol)} `
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
    };
    pickServer();
  };

  const searchServer = (inputProp) => {
    if (inputProp) {
      chooseServer(inputProp);
      return;
    }

    rl.question(`${colors.primaryClr("Search:")} `, (input) => {
      chooseServer(input);
    });
  };
  searchServer();
})();
