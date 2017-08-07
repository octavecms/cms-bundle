<?php

namespace VideInfra\CMSBundle\Page\Type;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SimpleTextPageType extends BasePageType
{
    const TYPE = 'simple_text';

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
        return 'VideInfraCMSBundle:SimpleText:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_SIMPLE_TEXT_PAGE_CREATE';
    }
}