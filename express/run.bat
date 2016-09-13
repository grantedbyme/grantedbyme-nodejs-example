:: Project Helper
::
:: author           GrantedByMe <info@grantedby.me>
:: copyright        2016 GrantedByMe

@ECHO OFF & SETLOCAL
PUSHD %~dp0
TITLE GBM

:SERVER
:: ECHO serving at port 5006
node index.js
GOTO :EXIT

:EXIT
POPD
:: PAUSE
ENDLOCAL
EXIT /B 0
GOTO :EOF
