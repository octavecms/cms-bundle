<?php

namespace Octave\CMSBundle\Page\Type;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class CustomPageType extends BasePageType
{
    const TYPE = 'custom';

    /**
     * @return string
     */
    public function getName()
    {
        return self::TYPE;
    }

    /**
     * @return string
     */
    public function getController()
    {
        return 'Octave\CMSBundle\Controller\CustomPageController::editAction';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_CUSTOM_PAGE_CREATE';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa-cube';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Custom';
    }
}