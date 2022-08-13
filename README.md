# DayZ Linux CLI Launcher

![dayz-cli-table-list](https://user-images.githubusercontent.com/52050303/184456339-5b4865cf-14d9-4a21-8a44-6f5664f17632.png)
![dayz-cli-info](https://user-images.githubusercontent.com/52050303/184457109-96026415-4f89-4a24-a6e0-c1b8a4b61268.png)

Many thanks to [bastimeyer][bastimeyer]

## About

This is an experimental launcher script for DayZ standalone on Linux when running the game via Proton.

Proton is currently unable to start the game's own regular launcher application which sets up mods and launch parameters for the game client. The game however does work fine when launching the client directly, so mods can be set up and configured manually, which is what this script does, similar to what the launcher would do.

Automatic Steam workshop mod downloads are currently unsupported due to a limitation of Steam's CLI. Workshop mods will therefore need to be subscribed manually via the web browser. A URL for each missing mod will be printed to the output.

Please see the "Install DayZ" section down below on how to get the game running on Linux.
Also read "Usage" to use cli full potential.

## Usage

```
To launch script you have to install nodeJS.

Follow instructions from "Install"

./dayz-cli-launcher.sh to launch script.

After launching it u can start searching servers, servers list length (maximum) as default will be 100, u can change it in index.js u have to find variable "maxListLength"

For better results u can use flags, please read "Flags" to use full potential of launcher.

After finding server that u want just enter ID of that server.

U can enter ur name (default = Survivor, u can change it in index.js to avoid rewriting ur name over and over, u have to find variable "userName" for that).

Also you can add server to favorites by simple choosing server ID and adding "+", to remove from favorites add "-", for ex: 1 + | 1 -

To see more information about server add "i" to ID so for ex: 1 i
Where u can read everything about server. From here u can also see which mods are server using, u can simple click url(s) and subscribe/unsubscribe them.
U can add/remove favorites from there as well.

You can change colors of text inside index.js just search "change color" and look around...
```

### Flags

| Flag                           | Meaning                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "text text1"                   | in quotes it will search string as one word, so instead of searching "text", "text1" it will show server where all of them are in.                                                                                  |
| min=x, max=y                   | min/max is filtring server by players, so if u want server with minimum 25 player, type min=25, server with maximum 75 players? max=75, u can also use both to find server above 25 and lower 75 players same time. |
| range(min,max), range(min-max) | range from min to max, basically its same as above but u have to enter both min and max. range(25,75), range(25-75)                                                                                                 |
| -3pp                           | hides third person servers                                                                                                                                                                                          |
| +3pp                           | shows only third person servers                                                                                                                                                                                     |
| -empty                         | hides empty servers                                                                                                                                                                                                 |
| -full                          | hides full servers                                                                                                                                                                                                  |
| -password                      | hides password secured servers                                                                                                                                                                                      |
| +fav                           | shows only favorites                                                                                                                                                                                                |
| -fav                           | hides all favorites                                                                                                                                                                                                 |
| +ping                          | Shows ping on server (Not recommended on large scale searchs! Unless u have time to wait...), also u can see ping on server for faster result by going to server information >> 'ID i'                              |
| +foreign                       | shows foreign servers (Not recommended! it breaks whole grid system, I have zero experience encoding/decoding utf-8 so before I will learn smth about it, I have decided to hide them as default)                   |

For ex:

```sh
  Search: "vanilla+ vibes" rearmed range(15,50) -fav -3pp -password
```

### Custom path

```
file: ./dayz-launcher.sh:

  Environment variables:

    STEAM_ROOT
      Set a custom path to Steam's root directory. Default is:
      ${XDG_DATA_HOME:-${HOME}/.local/share}/Steam
      which defaults to ~/.local/share/Steam

      If the flatpak package is being used, then the default is:
      ~/.var/app/com.valvesoftware.Steam/data/Steam

      If the game is stored in a different Steam library directory, then this
      environment variable needs to be set/changed.

      For example, if the game has been installed in the game library located in
        /media/games/SteamLibrary/steamapps/common/DayZ
      then the STEAM_ROOT env var needs to be set like this:
        STEAM_ROOT=/media/games/SteamLibrary
```

## Known issues

### Third party server query API

Server data is queried via the third-party dayzsalauncher.com JSON API when using the `--server` parameter. Previously, this was done via the daemonforge.dev JSON API, which unfortunately wasn't perfectly reliable. Please try running the launcher again if the query times out, and if the data returned by the server query API doesn't reflect the server's actual mod IDs, then custom mod IDs will need to be set as launch arguments.

### Steam doesn't launch the game

Sometimes the game doesn't launch despite the launcher correctly passing the right parameters to Steam. This is usually caused by a broken singleton process detection of Steam, where it passes the game's launch parameters to the original Steam process and then terminates. Restarting Steam and re-running the launcher fixes the issue.

One of the main reasons why this can happen is an [unresolved bug in the Steam client](https://github.com/ValveSoftware/steam-for-linux/issues/5753) which causes Steam to become unresponsive when launching it via `-applaunch` and passing arguments that reach a certain threshold in length. This problem occurs when trying to join servers which require loading lots of mods and which therefore increase the length of the launch parameters. In order to overcome this limitation, mod directories have been shrinked as much as possible in the `0.5.0` release, so that the launch parameters can be kept as short as possible. This comes at the cost of not being able to tell mod directories apart in the DayZ game directory, at least as a human, but this should solve the issue for the vast majority of servers. Please report any further issues on the issue tracker. Thank you.

### Case sensitivity of mod-internal file paths

Due to mods being developed on Windows and Windows not differentiating between file paths with different cases, mod developers sometimes don't care about case sensitivity of file names and directories. This can lead to loading issues on Linux when a file system without case insensitivity support is being used.

In case of ext4, which is the default file system on most distros, case insensitivity has only been implemented in kernel 5.2, which was released in July 2019 (later improved for encrypted file systems in kernel 5.13, released in June 2021). The requirements for enabling case insensitivity are an ext4 filesystem created with at least kernel version 5.2 while the `casefold` option was set, as well as the `+F` flag being set on one of the parent directories.

Please refer to your distro's documentation or search engine of choice for how to properly enable case folding/insensitivity on your file system and whether it's supported.

## Future ideas

- locate dayz-launcher.sh instead of using static path
- Improve performance while displaying ping
- Don't use a third party server query API and query the server directly
- Install mods automatically  
  Unfortunately, Steam doesn't support downloading workshop mods via the CLI and only the `steamcmd` CLI utility seems to be able to do this from a command line shell context, but this requires a Steam login via CLI parameters, which is a bit unpractical.
- If possible, resolve mod dependencies

## Install

To install the launcher, simply clone the git repository to ur home directory (Before I will change paths to dynamic, otherwise u have to change path inside index.js, u have to find function joinServer and add path of dayz-launcher.sh):

```sh
cd
git clone https://github.com/freakGE/dayz-linux-cli-launcher.git
touch dayz-cli-launcher.sh
chmod u+x dayz-cli-launcher.sh
```

Open script with any text editor and copy/paste.

```sh
#!/bin/bash

node dayz-linux-cli-launcher/JS/index.js
```

## Install DayZ

[Support for BattlEye anti-cheat for Proton on Linux has been officially announced by Valve on 2021-12-03.][battleye-announcement]

In order to get the game running on Linux, you first have to install the Steam beta client (see Steam's settings menu). Then install `Proton Experimental` and the `Proton BattlEye Runtime` (filter by "tools" in your games library). After that, set the "Steam play compatibility tool" for DayZ to "Proton Experimental" (right-click the game and go to properties).

### Important notes

In order for the game to actually run on Linux via Proton, the [`vm.max_map_count`][vm.max_map_count] kernel parameter needs to be increased, because otherwise the game will freeze while loading the main menu or after playing for a couple of minutes. Some custom kernels like TK-Glitch for example already increase this value from its [default value of `64*1024-6`][vm.max_map_count-default] to [`512*1024`][tkg-kernel-patch], but even this won't work reliably. Increasing it to `1024*1024` seems to work.

```sh
​sudo sysctl -w vm.max_map_count=1048576
```

Or apply it permanently:

```sh
​echo 'vm.max_map_count=1048576' | sudo tee /etc/sysctl.d/vm.max_map_count.conf
```

[bastimeyer]: https://github.com/bastimeyer
[battleye-announcement]: https://store.steampowered.com/news/group/4145017/view/3104663180636096966
[vm.max_map_count]: https://github.com/torvalds/linux/blob/v5.15/Documentation/admin-guide/sysctl/vm.rst#max_map_count
[vm.max_map_count-default]: https://github.com/torvalds/linux/blob/v5.15/include/linux/mm.h#L185-L202
[tkg-kernel-patch]: https://github.com/Frogging-Family/linux-tkg/blob/db405096bd7fb52656fc53f7c5ee87e7fe2f99c9/linux-tkg-patches/5.15/0003-glitched-base.patch#L477-L534
