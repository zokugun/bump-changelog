[@zokugun/bump-changelog](https://github.com/zokugun/bump-changelog)
====================================================================

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/bump-changelog?color=brightgreen)](https://www.npmjs.com/package/@zokugun/bump-changelog)
[![NodeJS Version](https://img.shields.io/badge/node.js-%3E%3D%2018.20-green)](#requirements)
[![Modules](https://img.shields.io/badge/modules-ESM-green)](#requirements)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-f87171?logo=kofi&logoColor=white)](https://ko-fi.com/daiyam)
[![Liberapay](https://img.shields.io/badge/Liberapay-facc15?logo=liberapay&logoColor=black)](https://liberapay.com/daiyam/donate)
[![PayPal](https://img.shields.io/badge/PayPal-5277C3?logo=paypal&logoColor=white)](https://paypal.me/daiyam99)

> `bump-changelog` promotes the current **Unreleased** section to a versioned release heading, optionally keeps an empty **Unreleased** section, and can update Markdown link references.

Features
--------

- **Version Bumping**: Inserts a new release section based on the updated package version.
- **Unreleased Management**: Keeps or removes the unreleased changes block depending on your config.
- **Reference Handling**: Adds and updates markdown link references for both old and new versions.
- **Template Rendering**: Uses custom templates to format release titles and dates dynamically.
- **Heading Styles**: Supports both ATX and Setext heading formats in the changelog document.
- **Sorting Modes**: Sorts references alphabetically, by version number, or leaves them unsorted.
- **Location Types**: Chooses between footnotes, headings, or sections for reference placement.

Installation
------------

```bash
npm add --save-dev @zokugun/bump-changelog
```

Requirements
------------

- **Node.js**: `v18.20` or higher
- **Modules**: ECMAScript Modules (`ESM`)

Quick Start
-----------

Add a version script to `package.json`. npm supplies the old and new versions to lifecycle scripts, so the command can run without arguments:

```json
{
   "scripts": {
      "version": "bump-changelog"
   }
}
```

Run a version bump to update the changelog:

```bash
npm version patch
```

Alternatively, pass both versions directly:

```bash
npx bump-changelog --old 1.2.3 --new 1.2.4
```

The command expects a `CHANGELOG.md` with an Unreleased heading. By default, it uses ATX headings (`## Unreleased`) and adds the new release heading immediately after it, keeping the Unreleased section in place.

### Configuration Example

Create `.bumpchangelogrc.yml` in your project root:

```yaml
heading:
   style: setext
release:
   template: '[v{version}] | {date:YYYY-MM-DD}'
unreleased:
   template: '[Unreleased]'
   action: remove
reference:
   release:
      name: v{version}
      link: https://github.com/owner/repo/releases/tag/v{version}
   unreleased:
      link: https://github.com/owner/repo/compare/v{version}...HEAD
```

This configuration promotes the Unreleased heading to a versioned heading and updates the reference links. Set `unreleased.action` to `retain` to keep the Unreleased section and insert the release heading below it.

CLI
---

```bash
bump-changelog [options]
```

| Option                | Description                                      |
| --------------------- | ------------------------------------------------ |
| `-n, --new <version>` | New version. Defaults to `npm_new_version`.      |
| `-o, --old <version>` | Previous version. Defaults to `npm_old_version`. |
| `-v, --version`       | Print the installed version.                     |

Both old and new versions are required. If the npm environment variables are not available, provide both options.

Configuration
-------------

Configuration files are optional. The tool checks `.bumpchangelogrc{.yml,.yaml,.json,}` from the project root.

The defaults are:

| Key                                   | Default                                         | Description                                                                                                 |
| ------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `heading.style`                       | `atx`                                           | Release heading style: `atx` (`## Title`) or `setext` (underlined title).                                   |
| `heading.separator.top`               | `blankline`                                     | Blank line before inserted content, or `none`.                                                              |
| `heading.separator.bottom`            | `blankline`                                     | Blank line after inserted content, or `none`.                                                               |
| `release.template`                    | `{version} - {date:YYYY-MM-DD}`                 | Format for the new release heading.                                                                         |
| `unreleased.action`                   | `retain`                                        | `retain` keeps the Unreleased heading; `remove` replaces it with the release heading.                       |
| `unreleased.template`                 | `Unreleased`                                    | Text used to locate and render the Unreleased heading.                                                      |
| `reference`                           | disabled                                        | Configure this to add or update Markdown references.                                                        |
| `reference.location.by`               | `footnote`                                      | Reference placement: `footnote`, `heading`, or `section`.                                                   |
| `reference.location.position`         | `after`                                         | For `heading` placement, references go after the Unreleased heading by default; `before` is also supported. |
| `reference.location.separator.top`    | `none` for `heading`; `blankline` for `section` | Spacing before heading- or section-based references.                                                        |
| `reference.location.separator.bottom` | `blankline`                                     | Spacing after heading- or section-based references.                                                         |
| `reference.release.name`              | `{version}`                                     | Label for a release reference.                                                                              |
| `reference.release.link`              | Required                                        | Link template for release references.                                                                       |
| `reference.sort.mode`                 | `alpha-version`                                 | Sort references by label and version; `alphabetical` and `none` are also supported.                         |
| `reference.sort.direction`            | `{ alpha: asc, version: desc }`                 | Sort labels ascending and versions descending.                                                              |
| `reference.unreleased.name`           | `unreleased`                                    | Label for the Unreleased reference.                                                                         |
| `reference.unreleased.link`           | Required                                        | Link template for the Unreleased reference.                                                                 |

When `reference` is enabled, both link templates are required.

Template Variables
------------------

- `{version}`: The new version. In reference names and links, it resolves to the version associated with that reference.
- `{date:FORMAT}`: Current date formatted with [Day.js format tokens](https://day.js.org/docs/en/display/format), such as `{date:YYYY-MM-DD}`.
- `{git.branch}`, `{git.commitId}`, `{git.distance}`: Values read from the current Git repository.

Contributions
-------------

Contributions are most welcome. Please:

- Open issues and feature requests under the repository discussions.
- Follow the [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Donations
---------

Support this project by becoming a financial contributor.

<table>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
      <td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
   </tr>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
      <td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
   </tr>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
      <td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
   </tr>
</table>

License
-------

Copyright &copy; 2026-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
