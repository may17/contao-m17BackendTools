<?php

$GLOBALS['TL_HOOKS']['parseBackendTemplate'][] = array('M17BackendTools', 'reparseBackendTemplate');
$GLOBALS['TL_HOOKS']['executePostActions'][] = array('M17BackendTools', 'myExecutePostActions');

if(TL_MODE == 'BE')
{
    $GLOBALS['TL_CSS'][] = 'system/modules/m17BackendTools/html/css/main.css';
    $GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/m17BackendTools/html/js/nested-1.3.js';
    $GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/m17BackendTools/html/js/m17BackendTools_future.js';
}