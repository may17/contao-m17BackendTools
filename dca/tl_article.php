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


$GLOBALS['TL_DCA']['tl_article']['config']['onload_callback'][] = array('m17BETArticle', 'loadJs');
$GLOBALS['TL_DCA']['tl_article']['list']['label']['format'] = '<span class="m17BT-lblName">%s</span> <span style="color:#b3b3b3;padding-left:3px">[<span class="currentCol">%s</span>]</span>';
$GLOBALS['TL_DCA']['tl_article']['list']['label']['label_callback'] = array('m17BETArticle', 'rewriteLabel');

/**
 * Exendts the tl_article dca backend class
 */
class m17BETArticle extends tl_article
{
    /**
     * Init javascript files
     */
    public function loadJs()
    {
        $GLOBALS['TL_MOOTOOLS'][] = '
        <script>
            //BE_TOOLS.tlArticle();
            //BE_TOOLS.addDragADrop();
        </script>';
    }

    /**
     * rewrite the label and adding the column list
     * @param $row
     * @param $label
     * @param DataContainer $dc
     * @return string
     */
    public function rewriteLabel($row, $label, DataContainer $dc)
    {
        if(strlen($this->Input->get('col')))
        {
            $this->setCol($this->Input->get('aID'), $this->Input->get('col'));
            $this->redirect($this->getReferer());
        }

        // Check permissions AFTER checking the tid, so hacking attempts are logged
		if (!$this->User->isAdmin && !$this->User->hasAccess('tl_article::published', 'alexf'))
		{
			return '';
		}

        $addIcon = $this->addIcon($row, $label);
        $getAPS = $this->getActivePageSections($dc);
        $_list = '<ul class="rtz"><li><img src="system/modules/m17BackendTools/html/img/icon/arrow_down.png" alt="Hit me Baby" class="m17BT-changeColBtn"><ul class="m17BT-colList">';
        foreach($getAPS as $sections) {
            //if($sections != $row['inColumn']) {
                $_label = ($GLOBALS['TL_LANG']['tl_article'][$sections] != '') ? $GLOBALS['TL_LANG']['tl_article'][$sections] : $row['inColumn'];
                $_list .= '<li><a href="'.$this->Environment->requestUri.'&col='.$sections.'&aID='.$row['id'].'">'.$_label.'</a></li>';
            //}
        }
        $_list .= '</ul></li></ul>';
        return $addIcon.$_list;
    }

    /**
     * Adding ajax support for the fast column switch
     * @param $intId
     * @param $col
     */
    private function setCol($intId, $col)
   	{
   		// Check permissions to edit
   		$this->Input->setGet('id', $intId);
   		$this->checkPermission();

   		// Check permissions to publish
   		if (!$this->User->isAdmin && !$this->User->hasAccess('tl_article::published', 'alexf'))
   		{
   			$this->log('Not enough permissions to publish/unpublish article ID "'.$intId.'"', 'tl_article toggleVisibility', TL_ERROR);
   			$this->redirect('contao/main.php?act=error');
   		}

   		$this->createInitialVersion('tl_article', $intId);

   		// Trigger the save_callback
   		if (is_array($GLOBALS['TL_DCA']['tl_article']['fields']['inColumn']['save_callback']))
   		{
   			foreach ($GLOBALS['TL_DCA']['tl_article']['fields']['inColumn']['save_callback'] as $callback)
   			{
   				$this->import($callback[0]);
   				$blnVisible = $this->$callback[0]->$callback[1]($col, $this);
   			}
   		}

   		// Update the database
   		$this->Database->prepare("UPDATE tl_article SET inColumn='". $col ."' WHERE id=?")
   					   ->execute($intId);

   		$this->createNewVersion('tl_article', $intId);
   	}
}