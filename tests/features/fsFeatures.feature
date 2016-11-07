Feature: Testing file operations
  I want to test node fs features

  Scenario: Test fs.stat
    Given parameter /notExisting.file
    When I execute statSync
    Then I shoud get false

#  Scenario: Write content to file
#    Given filePath C:\Users\piłka001\AppData\Local\DoITProfilerDesktopApp\data.loc
#    And content C:\Users\piłka001\AppData\Local\DoITProfilerDesktopApp\app-1.0.19\resources\app\app data
#    When I write it to file
#    Then I go to next scenario

#  Scenario: Read file content
#    Given filePath C:\Users\piłka001\AppData\Local\DoITProfilerDesktopApp\data.loc
#    When I read it
#    Then I get C:\Users\piłka001\AppData\Local\DoITProfilerDesktopApp\app-1.0.19\resources\app\app\data