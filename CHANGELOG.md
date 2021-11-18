# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
### Modified

## [1.10.2] - 2021-11-18
### Added
- Fix Cypress tests ([#79](https://github.com/sanger/stan-client/pull/79))
- Split labware menu ([#80](https://github.com/sanger/stan-client/pull/80))
- Record extract results page ([#75](https://github.com/sanger/stan-client/pull/75))
- Support releasing a box of stored labware ([#78] (https://github.com/sanger/stan-client/pull/78))
- Visium permabilisation page ([#83](https://github.com/sanger/stan-client/pull/83))
- RNA analysis page ([#77](https://github.com/sanger/stan-client/pull/77))

## [1.9.0] - 2021-10-28
### Added
- Staining QC page ([#69](https://github.com/sanger/stan-client/pull/69))
- Homepage dashboard (Seena's first solo story 🥳) ([#70](https://github.com/sanger/stan-client/pull/70))

### Modified
- Couple of new columns on the SGP Management page ([#73](https://github.com/sanger/stan-client/pull/73))

## [1.8.2] - 2021-10-07
### Modified
- Support editing the custom name of any location ([#65](https://github.com/sanger/stan-client/pull/65))
- Support a wider array of weird characters in the donor name ([#66](https://github.com/sanger/stan-client/pull/66))

## [1.8.1] - 2021-09-23
### Added
- Added "Fixatives" to the config page ([#61](https://github.com/sanger/stan-client/pull/61))
- Staining ([#60](https://github.com/sanger/stan-client/pull/60))
- Imaging ([#64](https://github.com/sanger/stan-client/pull/64))

## [1.7.0] - 2021-09-02
### Added
- SGP Management ([#54](https://github.com/sanger/stan-client/pull/54))
- SGP numbers for required operations ([#58](https://github.com/sanger/stan-client/pull/58))

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

[Unreleased]: https://github.com/sanger/stan-client/compare/master...HEAD
[1.10.2]: https://github.com/sanger/stan-client/compare/1.9.0...1.10.2
[1.9.0]: https://github.com/sanger/stan-client/compare/1.8.2...1.9.0
[1.8.2]: https://github.com/sanger/stan-client/compare/1.8.1...1.8.2
[1.8.1]: https://github.com/sanger/stan-client/compare/1.7.0...1.8.1
[1.7.0]: https://github.com/sanger/stan-client/compare/1.6.0...1.7.0
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
