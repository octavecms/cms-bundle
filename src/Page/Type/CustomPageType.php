<?php

namespace VideInfra\CMSBundle\Page\Type;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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
        return 'VideInfraCMSBundle:CustomPage:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_CUSTOM_PAGE_CREATE';
    }
}