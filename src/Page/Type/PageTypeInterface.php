<?php

namespace VideInfra\CMSBundle\Page\Type;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
interface PageTypeInterface
{
    /**
     * @return string
     */
    public function getName();

    /**
     * @return string
     */
    public function getController();

    /**
     * @return string
     */
    public function canCreateRole();

    /**
     * @return string
     */
    public function getIcon();

    /**
     * @return string
     */
    public function getLabel();
}