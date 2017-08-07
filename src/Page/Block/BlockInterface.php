<?php

namespace VideInfra\CMSBundle\Page\Block;

interface BlockInterface
{
    /**
     * @return string
     */
    public function getName();

    /**
     * @return string
     */
    public function getLabel();

    /**
     * @return string
     */
    public function getIcon();

    /**
     * @return string
     */
    public function getFormType();

    /**
     * @return string
     */
    public function getContentTemplate();
}