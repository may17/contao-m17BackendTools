<?php if (!defined('TL_ROOT')) die('You cannot access this file directly!');

/**
 * Contao Open Source CMS
 * Copyright (C) 2005-2012 Leo Feyer
 *
 * Formerly known as TYPOlight Open Source CMS.
 *
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program. If not, please visit the Free
 * Software Foundation website at <http://www.gnu.org/licenses/>.
 *
 * PHP version 5
 * @copyright  Joe Ray Gregory 2012
 * @author     Joe Ray Gregory <http://www.may17.de>
 * @package    Backend Tools
 * @license    LGPL
 * @filesource
 */

$GLOBALS['TL_DCA']['tl_content']['list']['global_operations']['editPage'] = array
    (
        'label'           => &$GLOBALS['TL_LANG']['MSC']['m17BT']['editPage'],
        'button_callback' => array('tl_m17BackendTools', 'editPage')
    );

/**
 * Extends the backend class
 */
class tl_m17BackendTools extends Backend
{

    /**
     * Adding a new item to the operation list
     * @param $href
     * @param $label
     * @param $title
     * @param $className
     * @param $attributes
     * @param $strTable
     * @param $root
     * @return string
     */
    public function editPage($href, $label, $title, $className, $attributes, $strTable, $root)
    {
        
        $dbObj = $this->Database->prepare('
            SELECT
                pid
            FROM
                tl_article
            WHERE
                id = ?
        ')->execute($this->Input->get('id'));

        $out = '<a href="contao/main.php?do=page&act=edit&id='.$dbObj->pid.'&showOnlyMain=1" class="m17editPage" data-lightbox="page 765 80%">'.$label.'</a>';
        
        return $out;
    }
}