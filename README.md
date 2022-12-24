# DayZ Linux CLI Launcher

## **About**

This is an CLI-Launcher for DayZ Standalone on Linux when running the game via Proton.

Script which launchs Dayz is written by <span class="link">[**bastimeyer**][bastimeyer]</span>

Please see the "**Install DayZ**" section down below on how to get the game running on Linux.

To setup CLI follow "**Install**"

Also read "**Usage**" to use CLI full potential.

<div class="gapY"><div>

![thumbnail-list]

<details><summary>Server Details</summary>
<img alt="Server Details" src="https://user-images.githubusercontent.com/52050303/184498538-6b920999-7d16-4a04-94a1-3995e6dc6e31.png"/>
<img alt="Server Mods" src="https://user-images.githubusercontent.com/52050303/184498541-fd65dc17-2050-4d05-ad28-db9fcbb34b81.png"/>
</details>
<div class="gapY"><div>

## **Usage**

For better results u can use flags, please read "**Flags**" to use full potential of launcher.

After finding server that u want just enter ID to join server, also you can use ID in various ways, please read "**Manipulate ID**".

You can change colors of text inside index.js just search "change color" and look around...

### **Command Line Options**

```
  -h
  --help
    Print this help text.

  -s
  --setup
    Setup config file.

  -d
  --debug
    Print debug messages to output.

  Ex:
    node index.js --debug
```

<div class="gapY"><div>

### **Manipulate ID**

| Key | Meaning                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| +   | Adds server in favorites for ex: 1 +                                                                                                                                                                                                                                     |
| -   | Removes server from favorites for ex: 1 -                                                                                                                                                                                                                                |
| i   | To see more information about server add "i" to ID for ex: 1 i, Where u can read everything about server. From here u can also see which mods are server using, u can simple click url(s) and subscribe/unsubscribe them. U can add/remove favorites from there as well. |

<div class="gapY"><div>

### **Flags**

| Flag                           | Meaning                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
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
  Search: Dayz Aftermath EU Rearmed range(15,50) -fav -3pp -password
```

<div class="gapY"><div>

## **Known issues**

- ### **Third party server query API**

  Server data is queried via the third-party dayzsalauncher.com JSON API when using the `--server` parameter. Previously, this was done via the daemonforge.dev JSON API, which unfortunately wasn't perfectly reliable. Please try running the launcher again if the query times out, and if the data returned by the server query API doesn't reflect the server's actual mod IDs, then custom mod IDs will need to be set as launch arguments.

- ### **Steam doesn't launch the game**

  Sometimes the game doesn't launch despite the launcher correctly passing the right parameters to Steam. This is usually caused by a broken singleton process detection of Steam, where it passes the game's launch parameters to the original Steam process and then terminates. Restarting Steam and re-running the launcher fixes the issue.

  One of the main reasons why this can happen is an [unresolved bug in the Steam client](https://github.com/ValveSoftware/steam-for-linux/issues/5753) which causes Steam to become unresponsive when launching it via `-applaunch` and passing arguments that reach a certain threshold in length. This problem occurs when trying to join servers which require loading lots of mods and which therefore increase the length of the launch parameters. In order to overcome this limitation, mod directories have been shrinked as much as possible in the `0.5.0` release, so that the launch parameters can be kept as short as possible. This comes at the cost of not being able to tell mod directories apart in the DayZ game directory, at least as a human, but this should solve the issue for the vast majority of servers. Please report any further issues on the issue tracker. Thank you.

- ### **Case sensitivity of mod-internal file paths**

  Due to mods being developed on Windows and Windows not differentiating between file paths with different cases, mod developers sometimes don't care about case sensitivity of file names and directories. This can lead to loading issues on Linux when a file system without case insensitivity support is being used.

  In case of ext4, which is the default file system on most distros, case insensitivity has only been implemented in kernel 5.2, which was released in July 2019 (later improved for encrypted file systems in kernel 5.13, released in June 2021). The requirements for enabling case insensitivity are an ext4 filesystem created with at least kernel version 5.2 while the `casefold` option was set, as well as the `+F` flag being set on one of the parent directories.

  Please refer to your distro's documentation or search engine of choice for how to properly enable case folding/insensitivity on your file system and whether it's supported.

<div class="gapY"><div>

## **Future ideas**

- Improve performance while displaying ping
- Don't use a third party server query API and query the server directly
- Install mods automatically  
  Unfortunately, Steam doesn't support downloading workshop mods via the CLI and only the `steamcmd` CLI utility seems to be able to do this from a command line shell context, but this requires a Steam login via CLI parameters, which is a bit unpractical.
- If possible, resolve mod dependencies

<div class="gapY"><div>

## **Install**

To install the launcher, simply clone the git repository

```sh
git clone https://github.com/freakGE/dayz-linux-cli-launcher.git
```

To launch script you have to install **nodeJS**.

First of all u have to setup config file in order to run everything smootly for that just follow steps

```sh
cd dayz-linux-cli-launcher/JS
node index.js --setup
```

After that answer questions

<details>
  <summary>For visualation</summary>
  <img alt="CLI Configuration" src="https://user-images.githubusercontent.com/52050303/185766008-e6605fba-7df8-4bfd-bb3b-e0eab0ac7d47.png"/>
</details>

Now copy value of Script, in my case "`node /home/vito/dayz-linux-cli-launcher/JS/index.js`"

CLI is ready to launch, just execute index.js but I recommend creating alias.
In order to do that follow steps down below:

- **Bash** `~/.bashrc`
- **ZSH** `~/.zshrc`

I'm using ZSH so in my case it will be ~/.zshrc

```sh
# Open with any text editor
nvim ~/.zshrc
```

Now scroll down to bottom of that file and add `alias {CLI-NAME}="{SCRIPT}"`

```sh
alias DayZ-CLI="node /home/vito/dayz-linux-cli-launcher/JS/index.js"
```

After saving that file open new terminal and type whatever name u passed in, in my case

```sh
DayZ-CLI
```

<div class="gapY"><div>

## **Install DayZ**

[Support for BattlEye anti-cheat for Proton on Linux has been officially announced by Valve on 2021-12-03.][battleye-announcement]

In order to get the game running on Linux, you first have to install the Steam beta client (see Steam's settings menu). Then install `Proton Experimental` and the `Proton BattlEye Runtime` (filter by "tools" in your games library). After that, set the "Steam play compatibility tool" for DayZ to "Proton Experimental" (right-click the game and go to properties).

<div class="gapY"><div>

### **Important notes**

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
[thumbnail-list]: https://user-images.githubusercontent.com/52050303/184456339-5b4865cf-14d9-4a21-8a44-6f5664f17632.png
[thumbnail-info]: https://user-images.githubusercontent.com/52050303/184498538-6b920999-7d16-4a04-94a1-3995e6dc6e31.png
[thumbnail-mods]: https://user-images.githubusercontent.com/52050303/184498541-fd65dc17-2050-4d05-ad28-db9fcbb34b81.png
