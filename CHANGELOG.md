# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- SGP Management ([#54](https://github.com/sanger/stan-client/pull/54))
- SGP numbers for required operations ([#58](https://github.com/sanger/stan-client/pull/58))
- Added "Fixatives" to the config page ([#61](https://github.com/sanger/stan-client/pull/61))

### Modified
- Support for more Storelight grid directions ([#53](https://github.com/sanger/stan-client/pull/53))
- Add username to the History table ([#52](https://github.com/sanger/stan-client/pull/52))
- Add work numbers to the History table ([#57](https://github.com/sanger/stan-client/pull/57))
- Removed max number validation for spatial locations at registration ([#59](https://github.com/sanger/stan-client/pull/59))

### Removed
- Sample ID from History table ([#55](https://github.com/sanger/stan-client/pull/55))

## [1.6.0] - 2021-08-13
### Modified
- Split Sectioning into separate Plan and Confirm pages([#50](https://github.com/sanger/stan-client/pull/50))

### Added
- History page ([#51](https://github.com/sanger/stan-client/pull/51))

## [1.5.0] - 2021-07-15
### Added
- Labware details page ([#45](https://github.com/sanger/stan-client/pull/45))
- More available search criteria ([#47](https://github.com/sanger/stan-client/pull/47))

## [1.3.0] - 2021-07-08
### Fixed
- Highest section bug ([#46](https://github.com/sanger/stan-client/pull/46))

## [1.2.0] - 2021-06-28
### Added
- Prevent accidental abandons ([#44](https://github.com/sanger/stan-client/pull/44))

### Modified
- Allow user to specify section numbers for slots on Sectioning confirm ([#43](https://github.com/sanger/stan-client/pull/43))

## [1.1.1] - 2021-05-13
### Added

### Modified
- Where possible, navigate back home once an operation is complete ([#38](https://github.com/sanger/stan-client/pull/38))

## [1.1.0] - 2021-05-05
### Added
 - User authorization ([#30](https://github.com/sanger/stan-client/pull/30))
 - STAN Configuration ([#34](https://github.com/sanger/stan-client/pull/34))
 - Display info in footer ([#37](https://github.com/sanger/stan-client/pull/37/))

## [1.0.0] - 2021-04-09
### Added
 - Slide Registration ([#24](https://github.com/sanger/stan-client/pull/24))
 - Shows external name clashes on block registration ([#24](https://github.com/sanger/stan-client/pull/24))
 - Visium cDNA & Storybook ([#28](https://github.com/sanger/stan-client/pull/28))
 - Multiple sections in slots ([#29](https://github.com/sanger/stan-client/pull/29))

### Modified
 - Renamed name to fixedName for Location ([#23](https://github.com/sanger/stan-client/pull/23))
 - Renamed Tissue Registration to Block Registration ([#24](https://github.com/sanger/stan-client/pull/24))

## [0.6.1] - 2021-03-01
### Added
 - Registration page ([#5](https://github.com/sanger/stan-client/pull/5))
 - XState
 - Labware Scan Panel ([#7](https://github.com/sanger/stan-client/pull/7) & [#8](https://github.com/sanger/stan-client/pull/8))
 - Sectioning layouts ([#9](https://github.com/sanger/stan-client/pull/9))
 - Label printing for sectioning ([#10](https://github.com/sanger/stan-client/pull/10))
 - Sectioning Confirmation ([#11](https://github.com/sanger/stan-client/pull/11))
 - Label printing after Registration ([#12](https://github.com/sanger/stan-client/pull/12))
 - Storage ([#13](https://github.com/sanger/stan-client/pull/13))
 - Release ([#15](https://github.com/sanger/stan-client/pull/15))
 - Release Files ([#16](https://github.com/sanger/stan-client/pull/16))
 - RNA Extraction ([#17](https://github.com/sanger/stan-client/pull/17))
 - Search ([#18](https://github.com/sanger/stan-client/pull/18))
 - Destroy Labware ([#19](https://github.com/sanger/stan-client/pull/19))

### Modified
 - Registration includes species ([#20](https://github.com/sanger/stan-client/pull/20))
 - Labware type included in search results ([#21](https://github.com/sanger/stan-client/pull/21))

## [0.1.0] - 2020-10-27
### Added
- Authentication ([#4](https://github.com/sanger/stan-client/pull/4))
- Application shell
- [Cypress testing library](https://docs.cypress.io/guides/overview/why-cypress.html)
- [Mock Service Worker](https://mswjs.io/docs/)

## [0.0.1] - 2020-09-25
### Added
- Everything!

[Unreleased]: https://github.com/sanger/stan-client/compare/1.6.0...HEAD
[1.6.0]: https://github.com/sanger/stan-client/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/sanger/stan-client/compare/1.3.0...1.5.0
[1.3.0]: https://github.com/sanger/stan-client/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/sanger/stan-client/compare/1.1.1...1.2.0
[1.1.1]: https://github.com/sanger/stan-client/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/sanger/stan-client/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/sanger/stan-client/compare/0.6.1...1.0.0
[0.6.1]: https://github.com/sanger/stan-client/compare/0.1.0...0.6.1
[0.1.0]: https://github.com/sanger/stan-client/compare/0.0.1...0.1.0
[0.0.1]: https://github.com/sanger/stan-client/releases/tag/0.0.1
