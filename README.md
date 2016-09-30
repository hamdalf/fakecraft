# fakecraft
# You must install:
# - node
# - mongodb
# Then you must start mongoDB
# > create folder [app]/data
# > sudo launchctl limit maxfiles 65536 65536
# > sudo launchctl limit maxproc 2048 2048
# > sudo ulimit -n 65536
# > sudo ulimit -u 2048
# > [mongoDB/bin]/mongod.exe --dbpath [app]/data (linux)
# > [mongoDB/bin]/mongod.exe --dbpath=[app]/data (windows)
# > [app]/node index.js