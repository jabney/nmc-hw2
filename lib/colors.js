
/**
  https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences

  echo -e "\033[31;1;4mHello\033[0m"
  where the first part makes the text red (31), bold (1), underlined (4) and the last part clears all this (0).

  ╔══════════╦════════════════════════════════╦═════════════════════════════════════════════════════════════════════════╗
  ║  Code    ║             Effect             ║                                   Note                                  ║
  ╠══════════╬════════════════════════════════╬═════════════════════════════════════════════════════════════════════════╣
  ║ 0        ║  Reset / Normal                ║  all attributes off                                                     ║
  ║ 1        ║  Bold or increased intensity   ║                                                                         ║
  ║ 2        ║  Faint (decreased intensity)   ║  Not widely supported.                                                  ║
  ║ 3        ║  Italic                        ║  Not widely supported. Sometimes treated as inverse.                    ║
  ║ 4        ║  Underline                     ║                                                                         ║
  ║ 5        ║  Slow Blink                    ║  less than 150 per minute                                               ║
  ║ 6        ║  Rapid Blink                   ║  MS-DOS ANSI.SYS; 150+ per minute; not widely supported                 ║
  ║ 7        ║  [[reverse video]]             ║  swap foreground and background colors                                  ║
  ║ 8        ║  Conceal                       ║  Not widely supported.                                                  ║
  ║ 9        ║  Crossed-out                   ║  Characters legible, but marked for deletion.  Not widely supported.    ║
  ║ 10       ║  Primary(default) font         ║                                                                         ║
  ║ 11–19    ║  Alternate font                ║  Select alternate font `n-10`                                           ║
  ║ 20       ║  Fraktur                       ║  hardly ever supported                                                  ║
  ║ 21       ║  Bold off or Double Underline  ║  Bold off not widely supported; double underline hardly ever supported. ║
  ║ 22       ║  Normal color or intensity     ║  Neither bold nor faint                                                 ║
  ║ 23       ║  Not italic, not Fraktur       ║                                                                         ║
  ║ 24       ║  Underline off                 ║  Not singly or doubly underlined                                        ║
  ║ 25       ║  Blink off                     ║                                                                         ║
  ║ 27       ║  Inverse off                   ║                                                                         ║
  ║ 28       ║  Reveal                        ║  conceal off                                                            ║
  ║ 29       ║  Not crossed out               ║                                                                         ║
  ║ 30–37    ║  Set foreground color          ║  See color table below                                                  ║
  ║ 38       ║  Set foreground color          ║  Next arguments are `5;n` or `2;r;g;b`, see below                       ║
  ║ 39       ║  Default foreground color      ║  implementation defined (according to standard)                         ║
  ║ 40–47    ║  Set background color          ║  See color table below                                                  ║
  ║ 48       ║  Set background color          ║  Next arguments are `5;n` or `2;r;g;b`, see below                       ║
  ║ 49       ║  Default background color      ║  implementation defined (according to standard)                         ║
  ║ 51       ║  Framed                        ║                                                                         ║
  ║ 52       ║  Encircled                     ║                                                                         ║
  ║ 53       ║  Overlined                     ║                                                                         ║
  ║ 54       ║  Not framed or encircled       ║                                                                         ║
  ║ 55       ║  Not overlined                 ║                                                                         ║
  ║ 60       ║  ideogram underline            ║  hardly ever supported                                                  ║
  ║ 61       ║  ideogram double underline     ║  hardly ever supported                                                  ║
  ║ 62       ║  ideogram overline             ║  hardly ever supported                                                  ║
  ║ 63       ║  ideogram double overline      ║  hardly ever supported                                                  ║
  ║ 64       ║  ideogram stress marking       ║  hardly ever supported                                                  ║
  ║ 65       ║  ideogram attributes off       ║  reset the effects of all of 60-64                                      ║
  ║ 90–97    ║  Set bright foreground color   ║  aixterm (not in standard)                                              ║
  ║ 100–107  ║  Set bright background color   ║  aixterm (not in standard)                                              ║
  ╚══════════╩════════════════════════════════╩═════════════════════════════════════════════════════════════════════════╝

  ╔══════════╦════════════╦════════════╗
  ║  Color   ║ Foreground ║ Background ║
  ╠══════════╬════════════╬════════════╣
  ║ black    ║     30     ║     40     ║
  ╠══════════╬════════════╬════════════╣
  ║ red      ║     31     ║     41     ║
  ╠══════════╬════════════╬════════════╣
  ║ green    ║     32     ║     42     ║
  ╠══════════╬════════════╬════════════╣
  ║ yellow   ║     33     ║     43     ║
  ╠══════════╬════════════╬════════════╣
  ║ blue     ║     34     ║     44     ║
  ╠══════════╬════════════╬════════════╣
  ║ magenta  ║     35     ║     45     ║
  ╠══════════╬════════════╬════════════╣
  ║ cyan     ║     36     ║     46     ║
  ╠══════════╬════════════╬════════════╣
  ║ white    ║     37     ║     47     ║
  ╚══════════╩════════════╩════════════╝

 */

/**
 * @typedef {'reset'|'bold'|'faint'|'black'|'red'|'green'|'yellow'|'blue'|'magenta'|'cyan'|'white'} ColorName
 */

/**
 * Ansi color escape sequences.
 *
 * https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
 *
 * @type {{[K in ColorName]: string}}
 */
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  faint: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

module.exports = colors
