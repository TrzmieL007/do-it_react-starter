finished(){
    time=$(date +"%T")
    echo -e "\033[7m $time \033[0m local time the operation has finished, with following result:"
}
FILE="webpack.config.dev.js"
while getopts rf: option
do
    case "${option}"
    in
        r) FILE="webpack.config.prod.js";;
        f) FILE=${OPTARG};;
    esac
done
echo -e "Started compiling \033[34m\033[47m \033[1mfrontEnd JavaScript files \033[0m with \033[1m\033[32mwebpack\033[0m"
node node_modules/webpack/bin/webpack.js --config $FILE > tmp.txt
RES=$?
cat tmp.txt
less tmp.txt | grep 'ERROR' > /dev/null
GR=$?
rm -f tmp.txt

if [ ${RES} -ne 0 ]; then
    echo ""
    finished
    echo -e "\033[41m\033[5m \033[37m\033[1mError! \033[25m\033[0m\033[47m \033[31mWebpack operation failed! \033[0m"
else
    if [ $GR -ne 0 ]; then
        finished
        echo -e "\033[42m \033[37m\033[1mSuccess! \033[0m\033[47m \033[32mOperation finished successfully! \033[0m"
        npm start
    else
        echo ""
        finished
        echo -e "\033[41m \033[37m\033[1mError! \033[0m\033[47m \033[31mWebpack operation finished with errors! \033[0m"
    fi
fi
